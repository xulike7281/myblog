
/**
 * Created by xutingyao on 2017/9/15.
 */
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    Category = mongoose.model('Category');

//设置首页的中间件
module.exports = function (app) {
    app.use('/posts', router);
};

router.get('/', function (req, res, next) {
    Post.find()
        .populate("author").populate("category")
        .sort("-created")
        .exec(function (err, posts) {
            if (err) return next(err);
            //我们对应的显示哪一页是前端穿过来的页码,当 没传递过来页码的时候我们默认将其设置为1
            var pageNum = Math.abs(parseInt(req.query.page || 1,10));
            //每页显示的文章数
            var pageSize = 10 ;
            //获取文章总数
            var totalCount = posts.length;
            //获取文章总数 除以每页显示的文章数 得到可以分成几页的结果
            var pageCount = Math .ceil(totalCount / pageSize)
            //当我们请求的页码大于我们总共的页码我们将其进行处理为等于
            if (pageNum > pageCount){
                pageNum = pageCount
            }
            //渲染index.jade视图模板,将数据传写回到前端,前端可以直接渲染
            res.render('blog/index', {
                title: 'xuwei的博客',
                posts: posts.slice((pageNum - 1)*pageSize,pageSize*pageNum),
                pageNum:pageNum,
                pageCount:pageCount,
                pretty:true
        });
    });
});


router.get('/category/:name', function (req, res, next) {
    Category.findOne({name:req.params.name})
        .exec(function (err,category) {
            if(err){
                return next(err)
            }
            //根据分类的名称 查找到所有符合该名称的文章 然后将数据写回前端 进行渲染
            Post.find({category:category,published:true})
                .sort("created")
                .populate("category")
                .populate("author")
                .exec(function (err,posts) {
                    if (err){
                        return next(err)
                    }
                    res.render('blog/category', {
                        posts: posts,
                        category:category,
                        pretty:true
                });
                })
    })
});
//文章详情页  可以查看全文
router.get('/view/:id', function (req, res, next) {

    if (!req.params.id){
        return next(new Error("no post id provided"))
    }
    //根据文章id 查找到文章 将数据写回前端进行渲染
    Post.findOne({_id:req.params.id})
        .populate("category")
        .populate("author")
        .exec(function (err, post) {
            if(err){
                return next(err)
            }
            res.render("blog/view",{
                post:post
            })
        })
});

//文章评论功能
router.post('/comments/:id', function (req, res, next) {


    Post.findOne({_id:req.params.id}).exec(function (err, post) {
        if(err){
            return next(err)
        }
        //定义评论的数据模板
        var comment = {
            email:req.body.email,
            content:req.body.content
        }
        post.comments.push(comment);
        //一旦修改了原型，则必须调用markModified(),表示该属性类型发生变化
        post.markModified("comments");
        //保存数据
        post.save(function (err, post) {
          // console.log("1111111111111111111111111111111")
            res.redirect("/posts/view/"+req.params.id)
        })
    })
});
//点赞功能 (有bug)
router.get('/favourite:id', function (req, res, next) {
    if (!req.params.id){
        return next(new Error("no post id provided"))
    }

    Post.findOne({_id:req.params.id})
        .populate("category")
        .populate("author")
        .exec(function (err, post) {
            if(err){
                return next(err)
            }
                post.mate.favourite = post.mate.favourite ?  post.mate.favourite + 1 : 1;
                post.markModified("mate");
                post.save(function (err,post) {
                    res.render("blog/view",{
                        post:post,

                    })
            })
        })
});