/**
 * Created by xutingyao on 2017/9/23.
 */


var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    auth = require('./user'),
    slug = require('slug'),
    Post = mongoose.model('Post'),
    User = mongoose.model('User'),
    Category = mongoose.model('Category');

module.exports = function (app) {
    app.use('/admin/posts', router);
};

//渲染后台首页
router.get('/',auth.requireLogin,function (req, res, next) {
    //排序功能
    var sortby = req.query.sortby?req.query.sortby:"created";
    var sortdir = req.query.sortdir?req.query.sortdir:"desc";
    if(["title","category","author","created","published"].indexOf(sortby   )===-1){
        sortby = "created";
    }
    if(['desc',"asc"].indexOf(sortdir)=== -1){
        sortdir = "desc"
    }
    var sortObj = {};
    sortObj[sortby] = sortdir;

    //condition
    var condition = {};

    if(req.query.category){
        condition.category = req.query.category.trim();
    }
    if(req.query.author){
        condition.author = req.query.author.trim();
    }
    User.find({},function (err,authors) {
        if (err) return next(err);
        Post.find(condition)
            .populate("author").populate("category")
            .sort(sortObj)
            .exec(function (err, posts) {
                if (err) return next(err);
                //当前页
                var pageNum = Math.abs(parseInt(req.query.page || 1,10));
                //每页显示的文章数
                var pageSize = 10 ;
                //文章总数
                var totalCount = posts.length;
                //总页数
                var pageCount = Math .ceil(totalCount / pageSize)

                if (pageNum > pageCount){
                    pageNum = pageCount
                }
                res.render('admin/post/index', {
                    title: 'xuwei的博客',
                    posts: posts.slice((pageNum - 1)*pageSize,pageSize*pageNum),
                    pageNum:pageNum,
                    pageCount:pageCount,
                    authors:authors,
                    sortdir:sortdir,
                    sortby:sortby,
                    pretty:true,
                    filter:{
                        category:req.query.category || "",
                        author:req.query.author || ""
                    }
                });
            });
    })
});

router.get('/add',auth.requireLogin, function (req, res, next) {
    res.render('admin/post/add', {
        action:"/admin/posts/add",
        pretty:true,
        post:{
            category:{_id:""}
        }
    });
});
router.post('/add',auth.requireLogin, function (req, res, next) {
    //validator 后台验证
    req.checkBody("title","文章标题不能为空").notEmpty();
    req.checkBody("category","必须指定文章分类").notEmpty();
    req.checkBody("content","内容不能为空").notEmpty();

    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        return res.render("admin/post/add",{
            errors:errors,
            title:req.body.title,
            content:req.body.content
        })
    }

    //获取到表单提交的数据
    var title = req.body.title.trim();
    var category = req.body.category.trim();
    var content = req.body.content
    //在数据库中查找一个作者 将查找奥作者赋值给 将要提交的post对象
    User.findOne({},function (err, author) {
        if(err){
            return next(err);
        }
        var post = new Post({
            title:title,
            category:category,
            content:content,
            author:author,
            published:true,
            mate:{favorite:0},
            comments:[],
            created:new Date()
        });
        //保存数据
        post.save(function (err,post) {
            if(err){

                res.redirect("/admin/posts/add");
            }else {

                res.redirect("/admin/posts");
            }

        })
    })

});

//文章编辑功能
router.get('/edit/:id', auth.requireLogin,function (req, res, next) {

    //判断文章id存不存在  不存在就抛出错误
    if (!req.params.id){
        return next(new Error("no post id provided"))
    }
    //根据文章id查找到文章
    Post.findOne({_id:req.params.id})
        .populate("category")
        .populate("author")
        .exec(function (err, post) {
            if(err){
                return next(err)
            }
            //渲染文章添加界面 将获取到的文章内容写回到前端 进行渲染
            res.render("admin/post/add",{
                action:"/admin/posts/edit/" + post._id,
                post:post
            })
        })
});

// 文章编辑提交功能
router.post('/edit/:id',auth.requireLogin, function (req, res, next) {
    if (!req.params.id){
        return next(new Error("no post id provided"))
    }

    Post.findOne({_id:req.params.id}).exec(function (err, post) {
        if(err){
            return next(err)
        }
        var title = req.body.title.trim();
        var category = req.body.category.trim();
        var content = req.body.content
        //将文章的属性重新赋值
        post.title = title;
        post.category = category;
        post.content= content;
        //保存数据
        post.save(function (err,post) {
            if(err){

                res.redirect("/admin/posts/edit/" + post._id);
            }else {

                res.redirect("/admin/posts");
            }

        })
    })
});
//文章删除功能
router.get('/delete/:id',auth.requireLogin, function (req, res, next) {
    if(!req.params.id){
        return next(new Error("no post id provided"))
    }
    //根据id查找文章 然后删除
    Post.remove({_id:req.params.id}).exec(function (err, rowsRemoved) {
        if(err){
            return next(err)
        }
        if(rowsRemoved){


            res.redirect("/admin/posts")
        }


    })
});

