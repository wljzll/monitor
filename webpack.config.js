const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    context: process.cwd(),
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'monitor.js'
    },
    devServer: {
        publicPath: '/',
        contentBase: path.resolve(__dirname, 'dist'),
        // 用来配置路由 express服务器
        before(router) {
            router.get('/success', function(req, res) {
                res.json({ id: 1 });
            });
            router.post('/error', function(req, res) {
                res.sendStatus(500);
            });
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            inject: 'head'
        })
    ]
}