var path = require('path');
var fs = require('fs');

module.exports = async function() {
  
  if(fs.existsSync(path.resolve('poutlet_plugin')) !== true) {
    fs.mkdirSync(path.resolve('poutlet_plugin'));

    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard'));

    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard/method'));
    
    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard/method/get'));

    
    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard/method/get/developer'));

    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard/method/get/static'));

    fs.mkdirSync(path.resolve('poutlet_plugin/dashboard/method/post'));

    
    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/config.json'), `{
      "version" : "1.0.0",
      "author" : "code9fair",
      "hostname" : "*"
    }`);

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/middleware.js'), '//Middleware');

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/root.js'), `module.exports = function(request, response) { response.html(\`<div><img src="/dashboard/static/logo.jpg" height="400" /></div><div><i class="fas fa-chart-line"></i> <a href="/dashboard/about">What's about Poutlet.</a></div>\`); return; };`);

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/about.js'), `module.exports = function(request, response) { response.html(\`<p>Poutlet is plugin file base route. It's work greate with website or api.</p><p><a href="/dashboard/developer"><i class="fas fa-users"></i> Developer</a></p>\`); return; };`);

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/developer/middleware.js'), '//Middleware');

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/developer/root.js'), `module.exports = function(request, response) { response.html(\`<div>Only 1 developer in this project : <a href="/dashboard/developer/code9fair">Code9fair</a></div>\`); return; };`);

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/get/developer/code9fair.js'), `module.exports = function(request, response) { response.html(\`<p>Hello, I'm Code9fair. Thank you for your support. <i class="far fa-laugh-squint"></i></p>\`); return; };`);


    fs.copyFileSync(__dirname + '/logo.jpg', path.resolve('poutlet_plugin/dashboard/method/get/static/logo.jpg'));


    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/post/middleware.js'), '//Middleware');

    fs.writeFileSync(path.resolve('poutlet_plugin/dashboard/method/post/root.js'), `module.exports = function(request, response) { response.json({status: 200, responseText: "Dashboard api ok!"}); return; };`);
    
  }

  if(fs.existsSync(path.resolve('poutlet_static')) !== true) {
    fs.mkdirSync(path.resolve('poutlet_static'));
  }

  if(fs.existsSync(path.resolve('poutlet_root')) !== true) {
    fs.mkdirSync(path.resolve('poutlet_root'));

    fs.mkdirSync(path.resolve('poutlet_root/method'));

    fs.mkdirSync(path.resolve('poutlet_root/method/get'));

    fs.writeFileSync(path.resolve('poutlet_root/method/get/root.js'), `module.exports = function(request, response) { response.html(\`<i class="fas fa-smile-wink"></i> Hi world. I'm Poutlet. <a href="/dashboard">Go to dasboard</a>\`); return; };`);

    fs.writeFileSync(path.resolve('poutlet_root/method/get/root.css'), `body { background-color: #F1F2F3; color: #DA0000; }`);

    
    fs.writeFileSync(path.resolve('poutlet_root/global.css'), `body {
      margin: 0;
      padding: 0;
    }`);

    fs.mkdirSync(path.resolve('poutlet_root/method/post'));
    
    fs.writeFileSync(path.resolve('poutlet_root/method/post/root.js'), `module.exports = function(request, response) { response.json({status: 200, responseText: "OK"}); return; };`);
  };
  
  return true;
};