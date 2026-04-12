---
title: "My early career notes (in Chinese)"
description: ""
added: "Apr 24 2016"
tags: [web]
updatedDate: "July 22 2023"
---

> 将早期工作刚接触 Web 开发不久时的笔记中有价值的部分提炼出来，记录在这里成为一篇文章，值得纪念。

每台开发机都是一个完整的环境，包括了 nginx, redis 等，即本地拥有服务器。

动态页面不是请求某一个文件，请求某一个文件只能是静态的（js 也属于是静态资源）。浏览器请求的是一个 url，服务端匹配这个 url，配数据和模板去渲染页面，匹配不到就是 404 错误。如果服务器端有错误（smarty 报错，php 报错，数据库报错等）就会返回 500，这些都是服务器端解析的时候发生的错误，而标签、样式、js 等都会在浏览器端解析。所有页面公用一个模板，符合 MVC，PHP 控制器根据 url 的不同，在渲染页面（即调用模板）时 assign 不同的数据。比如 `bj.fang.lianjia.com/loupan/p_aaa/`和 `bj.fang.lianjia.com/loupan/p_bbb/` 是两个不同的楼盘页面，PHP 控制器会让这样的 url 都调用同一个模板，页面显示同样的布局和样式，只是数据不同（模板和数据是分离的）。

在模板文件中查看 php assign 给 tpl 的变量，比如 `<script type="text/javascript">window.aaa = {json_encode($commentlist)}</script>`

一定要分清哪些是在服务器端做的事情，哪些是在浏览器端做的事情。在服务端的又分为 nginx 和 fastCGI 两部分，fastCGI 是由 CGI（common gateway interface，通用网关接口）发展而来，用来提高 CGI 程序的性能，是 http 服务器（nginx、apache）和动态脚本语言（php）之间的通信接口。

> 1. Both CGI and FastCGI just describe how to pass a bunch of values — such as HTTP headers, the request body and client input — to the server-side part of your website.
> 2. CGI works by starting, executing and terminating a process for every incoming request. The nascent web community quickly learned that this was a bad idea, and invented technologies like PHP and FastCGI to help avoid that extra overhead and keep code resident in-memory instead.
> 3. FastCGI is a protocol that defines how your web server (Apache, nginx, lighttpd, etc.) communicates to your CGI program (your server side application in PHP, Ruby, Python, etc.) about the requests it receives. It's an extension of CGI. To make use of FastCGI, most web servers have a module installed by default to handle all of this.

Web server（如 nginx）只是内容的分发者。比如，请求 `/index.html`，那么 server 会去文件系统中找到这个文件，发送给浏览器，这里分发的是静态数据。如果现在请求的是 `/index.php`，nginx 知道这个不是静态文件，需要去找 PHP 解析器来处理，那么它会把这个请求简单处理后交给 PHP 解析器。Nginx 会传哪些数据给 PHP 解析器呢？要有 url、查询字符串、POST 数据、HTTP header，CGI 就是规定要传哪些数据、以什么样的格式传递给后方处理这个请求的协议（是 php 文件的执行环境）。接下来 PHP 解析器会解析 `php.ini` 文件，初始化执行环境，然后处理请求，再以 CGI 规定的格式返回处理后的结果，退出进程。最后 server 再把结果返回给浏览器。

不同的项目在不同的机器中，也可以是一台机器（虚拟主机，也叫共享主机），每个项目对应不同的端口。也可能是同一端口，此时不能直接访问 ip 地址，需要依靠域名区分，比如 `git.lianjia.com` 和 `wiki.lianjia.com` 在同一台机器上，使用的是同一端口，这个时候只能通过域名区分请求，需要 DNS 解析，根据请求找相应的 nginx 配置文件 `/local/nginx1.7.7/conf/virtualhost/xxx.conf`。Nginx 监听某一端口，按照配置文件的规则（过程中可能会有 url rewrite）定位到某一个 php 文件，然后将环境交给 fastCGI。框架中的入口文件有 `APP_MODE`，可以找到项目的配置文件。PHP 根据项目的配置文件进入到某个模块，再根据模块中配置的路由规则，进入到某个 controller 的某个 action，调用 render 函数将结果返回给 nginx，最终返回给浏览器（返回结果是浏览器可以识别的内容）。

> 这里补充一个问题，Why can't access website by IP but can access by qualified domain?
>
> It is likely that multiple domains are served from the same server. In this case, the server relies on the `host` header of the request to specify what website to serve. If there is no default configured, then it will return a server error. A workaround in this case is to add the IP address and host name to the client system's hosts file.
>
> In addition, if there is a certificate warning, it is a name mismatch error, which indicates that the domain name in the SSL certificate does not match the URL/address used to access the web server.

### URL Rewrite

- `abc.com/show_a_product.php?product_id=7`
- `abc.com/products/7/`

The problem with the first URL structure is that it is not memorable, but you can tell from the second URL what you're likely to find on that page. Search engines can split that URL into words, and they can use that information to better determine the content of the page. Unfortunately, the second URL cannot be easily understood by a server without some work on our part. When a request is made for that URL, the server needs to work out how to process that URL so that it knows what to send back to the user. **URL rewriting** is a technique used to "translate" a URL like this into something the server can understand. We need to tell the server to internally redirect all requests for the URL "/products" to "show_a_product.php".

### 关于单页应用无刷新更新 URL

- 通过 URL 的 `#` 哈希片段实现路由切换。当哈希变化时，触发 `hashchange` 事件，动态更新页面内容。例如，导航链接通过修改哈希值（如 `<a href="#/home">`），在 JavaScript 中监听 `hashchange` 事件，根据 `location.hash` 的值使用 `switch` 语句匹配并渲染对应内容到指定容器。

- 基于 History API 使用 HTML5 的 `history.pushState()` 和 `popstate` 事件实现。拦截 `<a>` 标签的默认跳转行为，通过 `history.pushState()` 修改 URL 并手动触发内容更新。页面首次加载或用户点击前进/后退按钮时，通过监听 `popstate` 事件，根据 `location.pathname` 渲染内容。现代框架默认使用 History 模式，开发者只需声明式配置路由，无需手动操作 `history.pushState()` 或监听 `popstate`。

### 关于 SEO

如果要做 SEO，就是每个详情页、每个分页、每个搜索结果都是一个新的页面，新的URL（不是query参数的变化）。对于详情页就是根据 URL 的不同，smarty 模板生成不同的数据（html代码）。对于列表搜索页，选项和分页都是跳新的页面，URL 发生变化，PHP 设置路由规则，调用同一个模板。模板中的数据也是通过 smarty 赋值，即这些链接是 smarty 解析后就确定的，不是 js 计算的。比如 `bj.fang.lianjia.com/loupan/pg3/` 代表楼盘列表的第三页（说链接是确定的，是因为这个时候它的上一页和下一页链接已经确定为 `/pg2/` 和 `/pg4/`，它们不是在 js 的点击事件中计算出的，而是smarty的数据确定的），再比如 `bj.fang.lianjia.com/loupan/haidian/` 代表楼盘列表的海淀选项。这样做搜索引擎可以追踪到更多的链接，抓到更多的页面。

### 模板的使用

```html
<script type="text/template" id="noresultTpl">
  <div class="no_result">
    <div class="no_pic">
      <img src="{fe static="/pc/asset/join/images/list_none.png"}">
    </div>
    <p>呣，没有对应<%= keyword %>结果，换个搜索条件吧</p>
  </div>
</script>

// str 即为可以 append 进 DOM 的节点 var str =
$.template($('#noresultTpl').html()).render({keyword: ''});
```

```js
// Before: Global variables
var myUtil = { doSomething: function () {} };

// After: AMD modules
define("myModule", ["dependency1", "dependency2"], function (dep1, dep2) {
  return {
    doSomething: function () {
      dep1.action();
      dep2.action();
    },
  };
});

// Usage
require("myModule").doSomething();
```

### Server-side MVC

```js
/**
 * Router - Maps URLs to controllers (actions) and views (models)
 */

module.exports = function (router) {
  /**
   * GET /browse - Browse documents
   * Action: action/index.js → index()
   * Model: model/index.js → getDocuments()
   * View: page/index.tpl
   */
  router.route("/browse").get(router.action("index").browse);
};

/**
 * Action Controller - Handles request logic
 * File: server/action/index.js
 */

var model = require("../model/index");
var docUtil = require("../libs/docUtil");

exports.browse = function (req, res) {
  // Get query parameters
  var category = req.query.category || "hot";
  var page = parseInt(req.query.page) || 1;
  var pageSize = 20;

  // Fetch data from model
  model
    .getDocuments({
      category: category,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    })
    .then(function (data) {
      // Process data
      var docs = data.documents.map(function (doc) {
        return {
          id: doc.id,
          title: doc.title,
          thumbnail: doc.thumb_url,
          type: docUtil.fileType(doc.doc_type),
          size: docUtil.fileSize(doc.file_size),
          viewUrl: docUtil.viewUrl(doc.id, {
            from: "browse",
            category: category,
          }),
        };
      });

      // Render template with data
      res.render("browse", {
        documents: docs,
        category: category,
        page: page,
        title: category + " Documents",
        keywords: "documents, PDF, Word, " + category,
      });
    })
    .catch(function (err) {
      res.render("error", {
        message: "Failed to load documents",
        status: 500,
      });
    });
};

/**
 * Model - Handles data fetching and caching
 * File: server/model/index.js
 */

exports.getDocuments = function (opts) {
  var cacheKey = "docs:" + opts.category + ":" + opts.offset;

  // Check cache first
  return cache.get(cacheKey).then(function (cached) {
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from backend API
    return docService.getDocuments(opts).then(function (data) {
      // Cache for 1 hour
      cache.set(cacheKey, JSON.stringify(data), 3600);
      return data;
    });
  });
};
```
