# website-protector
Protect your website files from intentional downloads and reverse engineering.
* Prevents full download using `File->Save Page As...` or `Right Click->Save As...`
* Prevents direct access to the images and js files
* Prevents saving through the use of website copiers like HTTrack

## Prerequisites
1. Your server should run *Apache*
2. Your server should run *PHP*

## Installation
1. Copy and `.htaccess` file and `protected` directory and paste them to your site directory
2. Make sure that the folder `protected/image` and `protected/protect.json` file are both writeable: run `chmod 777` for both items.

## Troubleshooting
1. If in case your web page's images are behaving undexpectedly (usually due to incorrect formatting), set the value of `protect_images` to *false* on the `protected/protect.json` file
