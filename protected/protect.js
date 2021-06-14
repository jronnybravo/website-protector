function appendScript(url) {
    var script = document.createElement("script");
    script.src = url;
    script.type = 'text/javascript';

    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);

    return script;
}

(function(url, position, callback){
    position = position || 0;
    if (!window.jQuery) {
        let script = appendScript(url);
        script.onload = function() {
            if(typeof callback == 'function') {
                callback(jQuery);
            }
        };
    } else {
        if(typeof callback == 'function') {
            callback(jQuery);
        }
    }
}('https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js', 5, function($) {
    $.getJSON('protected/protect.json', response => {
        if(response.protect_stylesheets) {
            protectStylesheets();
        }
        if(response.protect_images) {
            protectImages();
        }
        if(response.protect_scripts) {
            protectScripts(response.scripts);
        }
    });

    function protectStylesheets() {
        // move css to style tag so to prevent file download through the browser
        $("link[rel='stylesheet']").each(function() {
            let link = $(this);
            let linkUrl = link.attr("href");

            let isOnTheSameDomain = true;
            if(linkUrl.startsWith('http')) {
                let currentDomain = window.location.hostname.toLowerCase();
                let linkDomain = (new URL(linkUrl)).host.toLowerCase();
                isOnTheSameDomain = currentDomain == linkDomain;
            }

            if(isOnTheSameDomain) {
                $.when($.get(linkUrl))
                    .done(function(content, a, b) {
                        
                        let currentUrl = window.location.href;
                        let currentUrlParts = currentUrl.split('/');
                        let lastCurrentUrlPart = currentUrlParts[currentUrlParts.length - 1];
                        if(lastCurrentUrlPart.indexOf(".") > -1) {
                            currentUrlParts.pop();
                        }
                        currentUrl = currentUrlParts.join('/') + '/';

                        let fullUrl = currentUrl + linkUrl;
                        
                        let directoryParts = fullUrl.split('/');
                        
                        let possibleParentDirectoryRefs = directoryParts.length - 1;
                        for(let i = possibleParentDirectoryRefs; i > 0; i--) {
                            let needle = '../'.repeat(i);

                            let parentDirectory = '';
                            for(let j = 0; j < possibleParentDirectoryRefs - i; j++) {
                                parentDirectory += (directoryParts[j] + '/');
                            }

                            while(content.indexOf(needle) > -1) {
                                content = content.replace(needle, parentDirectory);
                            }
                        }
                    
                        let style = $('<style type="text/css" />').text(content);
                        link.after(style);
                        link.remove();
                    });
            }
        });
    }
    
    function protectImages() {
        // make images as divs with backgroud to prevent file download through the browser
        let images = $("img:not(.unprotected)");
        for(let i = 0; i < images.length; i++) {
            let image = images[i];
            let imgWidth = $(image).width();
            let imgHeight = $(image).height();
            if(imgWidth && imgHeight) {
                let newImage = $("<div>");
                for(let i = 0; i < image.attributes.length; i++) {
                    let attr = image.attributes[i];
                    if(!['src'].includes(attr.name)) {
                        newImage.attr(attr.name, attr.value);    
                    }
                }
                let imgAttrSrc = $(image).attr("src");
                let display = $(image).css("display");
                if(display == 'inline') {
                    display = 'inline-block';
                }
                newImage.css({
                    'background-image': `url("${imgAttrSrc}")`,
                    'background-repeat': 'no-repeat',
                    'background-size': 'contain',
                    'width': imgWidth,
                    'height': imgHeight,
                    'display': display,
                });
                $(image).after(newImage);
                $(image).remove();
            }
        }
    }

    function protectScripts(scripts) {
        var queue = scripts.map(script => {
            return $.ajax({
                async: false,
                url: script,
                dataType: "script"
            });
        });
        $.when.apply(null, queue).done(() => {});
    	$("script").remove();
    }
}));