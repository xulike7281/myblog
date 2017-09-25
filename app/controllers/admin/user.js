//引入相关模块
var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  hash = require("md5"),
  passport = require("passport"),
  User = mongoose.model('User');

//用户模块
module.exports = function (app) {
    //设置后台用户中间件
  app.use('/admin/users', router);
};
//暴露这个方法 在category文件和post文件中使用 判断用户有没有登录 没有登录的就重定向到登录界面
module.exports.requireLogin = function (req, res, next) {
    if(req.user){
        next();
    }else {
        req.flash("error","只有登录用户才可以查看后台数据!!");
        res.redirect("/admin/users/login")
        next()
    }
}
//登录界面路由
router.get('/login', function (req, res, next) {
    // console.log("11111111111111111111111111111111111111")
    // res.send("1111")
   res.render("admin/user/login",{
       pretty:true
   })
});
//登录界面提交数据匹配的路由
router.post('/login',passport.authenticate('local', { failureRedirect: '/admin/users/login' }), function (req, res, next) {
    console.log('user longin success',req.body)
    res.redirect("/admin/posts")
});
router.get('/register', function (req, res, next) {
    res.render("admin/user/register",{
        pretty:true
    })
});
//注册界面提交数据匹配的路由
router.post('/register', function (req, res, next) {
    //后台表单提交的数据校验
    req.checkBody("email","邮箱不能为空").notEmpty().isEmail();
    req.checkBody("password","密码不能为空").notEmpty();
    req.checkBody("confirmPassword","两次密码不匹配").notEmpty().equals(req.body.password);

    console.log("1111111111111111111111111")
    var errors = req.validationErrors();
    if(errors){
        console.log(errors);
        return res.render("admin/user/register",req.body)
    }

    console.log("222222222222222222222")
    //将提交的注册信息 赋值给user对象
    var user = new User({
        name:req.body.email.split("@").shift(),
        email:req.body.email,
        password:hash(req.body.password),
        created: new Date()
    })
    console.log("333333333333333333")
    //保存数据
    user.save(function (err, user) {

        if(err){
            console.log("注册失败");
            res.render("admin/user/register")
        }else {
            console.log("注册成功");
            res.redirect("/admin/users/login")
        }
    })
});
//用户注销路由
router.get('/logout', function (req, res, next) {
    req.logout();
    //重定向到前台首页
    res.redirect("/");
});












