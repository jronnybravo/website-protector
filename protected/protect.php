<?php
function getRefererDomain() {
    $refererUrlParts = parse_url($_SERVER['HTTP_REFERER']);
    return strtolower($refererUrlParts['host']);
}

function getFileExtension($requestUri) {
    $fullUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") 
        . "://$_SERVER[HTTP_HOST]$requestUri";
    $fullUrlParts = parse_url($fullUrl);
    $urlPathSegments = explode('.', $fullUrlParts['path']);
    return $urlPathSegments[count($urlPathSegments) - 1];
}

$fullFilePath = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['REDIRECT_URL'];
if(stripos(strrev($fullFilePath), '/') == 0) {
	$indexFileCandidates = ['index.php', 'index.html', 'index.htm'];
	foreach($indexFileCandidates as $indexFileCandidate) {
		if(file_exists($fullFilePath . $indexFileCandidate)) {
			$fullFilePath .= $indexFileCandidate;
			break;
		}
	}
}
$extension = getFileExtension($fullFilePath);
$mimeContentType = mime_content_type($fullFilePath);

$currentDomain = strtolower($_SERVER['HTTP_HOST']);
if(isset($_SERVER['HTTP_REFERER'])) {
    $refererDomain = getRefererDomain();
    if($currentDomain == $refererDomain) {
        $contentTypes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'png' => 'image/png',
            'jpg' => 'image/jpg',
            'json' => 'application/json',
        ];
        if(isset($contentTypes[$extension])) {
            header('Content-Type: ' . $contentTypes[$extension]);
        }
        try {
            readfile($fullFilePath);
            die;
        } catch(Exception $e) { }
    }
} else if($mimeContentType == 'text/html') {
    $currentDomain = strtolower($_SERVER['HTTP_HOST']);

	$doc = new DOMDocument();
    libxml_use_internal_errors(true);
    $doc->loadHTMLFile($fullFilePath);

    $protectedItems = json_decode(file_get_contents('protect.json'));
    $protectedScripts = [];
    $deferredScripts = [];
    while (($scriptTags = $doc->getElementsByTagName("script")) && $scriptTags->length) {
    	$scriptTag = $scriptTags->item(0);
    	if($src = $scriptTag->getAttribute("src")) {
            $isOnTheSameDomain = true;
            if (strpos($src, 'http') === 0) {
                $scriptUrlParts = parse_url($src);
                $scriptDomain = strtolower($scriptUrlParts['host']);
                $isOnTheSameDomain = $scriptDomain == $currentDomain;
            }
            if($isOnTheSameDomain) {
                $protectedScripts[] = $src;
            } else {
                $deferredScripts[] = $scriptTag;
            }
    	} else {
            $filename = hash('md5', $scriptTag->textContent);
            file_put_contents("build/{$filename}.js", $scriptTag->textContent);
            $protectedScripts[] = "protected/build/{$filename}.js";
        }
        $scriptTag->parentNode->removeChild($scriptTag);
    }
    $protectedItems->scripts = $protectedScripts;
    file_put_contents('protect.json', json_encode($protectedItems, JSON_PRETTY_PRINT));

    $body = $doc->getElementsByTagName('body')[0];
    foreach($deferredScripts as $deferredScript) {
        $body->appendChild($deferredScript);
    }
    
    $protectJs = $doc->createElement("script");
    $protectJs->setAttribute('src', 'protected/protect.js');
    $body->appendChild($protectJs);

    echo $doc->saveHTML();
    die;
}