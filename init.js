var request = require('sync-request');
var registryUrl = process.argv.slice(2)[0].toString();
var newRegistryUrl = process.argv.slice(2)[1].toString();

function requestUrl(method, url) {
	var res = request(method, url), body;

	if (res.statusCode !== 200) {
		console.error("\n\n\n\tFailed to get the request body!\n\tMethod: " + method + "\n\tUrl: " + url + "\n\n\n");
		body = null;
	} else {
		body = JSON.parse(res.getBody('utf8'));
	}

	return body;
}

function filterImages(images) {
	var imagesObj = {};
	var data;

	images.forEach(function(image) {
		data = requestUrl('GET', 'https://' + registryUrl + '/v2/' + image + '/tags/list');
		if (data && data.tags) {
			var tags = data.tags;

			if (!imagesObj[image]) {
				imagesObj[image] = [];
			}
			imagesObj[image] = imagesObj[image].concat(tags);
		}
	});

	return imagesObj;
}

function logCommands(imagesObj) {

	Object.keys(imagesObj).forEach(function(image) {
		imagesObj[image].forEach(function (tag) {
			var imageString =  registryUrl + '/' + image + ':' + tag;
			var newImageString = newRegistryUrl + '/' + image + ':' + tag;

			console.log("docker pull " + imageString + "\n"
			+ "docker tag " + imageString + " " + newImageString + "\n"
			+ "docker push " + newImageString);
		});
	});
}

logCommands(filterImages(requestUrl('GET', 'https://' + registryUrl + '/v2/_catalog').repositories));