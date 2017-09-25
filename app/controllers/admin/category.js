/**
 * Created by xutingyao on 2017/9/23.
 */
/**
 * Created by xutingyao on 2017/9/23.
 */

//分类模块
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    auth = require('./user'),
    Post = mongoose.model('Post'),
    Category = mongoose.model('Category');

//设置分类中间件
module.exports = function (app) {
    app.use('/admin/categories', router);
};


router.get('/', auth.requireLogin,function (req, res, next) {
    res.render('admin/category/index', {
        pretty:true
    });
});

//添加分类功能
router.get('/add',auth.requireLogin, function (req, res, next) {
    //渲染分类界面
    res.render('admin/category/add', {
        action:"/admin/categories/add",
        pretty:true,
        category:{_id:""}
    });
});

//提交增加分类 功能
router.post('/add', auth.requireLogin,function (req, res, next) {
    //后端validator方法进行表单验证
    req.checkBody("name","分类标题不能为空").notEmpty();

    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        //如果提交失败 还是渲染添加分类界面
        return res.render("admin/categories/add",{
            errors:errors,
            name:req.body.name,
        })
    }

    var name = req.body.name.trim();

    //声明一个新的分类对象 传入必须传入的字段
    var category = new Category({
        name:name,
        created:new Date()
    });
    //保存数据
    category.save(function (err,category) {
        if(err){
            console.log("保存失败");
            res.redirect("/admin/categories/add");
        }else {
            console.log("保存成功");
            res.redirect("/admin/categories");
        }

    })

});

//分类编辑功能

router.get('/edit/:id',auth.requireLogin, getCategoryById,function (req, res, next) {
    //渲染添加分类的页面 将数据库的数据写回到前端进行渲染
    res.render('admin/category/add', {
        action:"/admin/categories/edit/" + req.category._id,
        category:req.category
    });
});
//提交编辑分类功能
router.post('/edit/:id',auth.requireLogin, getCategoryById,function (req, res, next) {
    var category=req.category;

    var name = req.body.name.trim();
    //获取到提交的数据绑定到category
    category.name = name;
    //保存数据
    category.save(function (err,category) {
        if(err){
            console.log("分类编辑失败");
            res.redirect("/admin/categories/edit/" + post._id);
        }else {
            console.log("分类编辑成功");
            res.redirect("/admin/categories");
        }

    })

});

//删除分类的功能
router.get('/delete/:id',auth.requireLogin, getCategoryById,function (req, res, next) {

    //调用mongoose的全局方法remove删除数据库数据
    req.category.remove(function (err, rowsRemoved) {
        if(err){
            console.log("分类删除失败");
            return next(err)
        }
        if(rowsRemoved){
            console.log("分类删除成功");
            res.redirect("/admin/categories")
        }


    })
});
//抽取的一个公用的获取分类的方法
function getCategoryById(req,res,next) {
    if (!req.params.id){
        return next(new Error("no category id provided"))
    }
    Category.findOne({_id:req.params.id})
        .exec(function (err, category) {
            if(err){
                console.log("查找文章失败");
                return next(err);
            }
            if(!category){
                console.log("没有找到文章");
                return next(new Error("category not found:",req.params.id))
            }
            req.category = category;
            next();
        })
}