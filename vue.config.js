module.exports = {
    pages: {
        index: {
            entry: 'src/main.js',
            // index页面模板来源
            template: 'public/index.html',
            // index页面最终打包在dist目录下输出文件名
            filename: 'index.html',
            // 当使用 title 选项时，template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
            title: 'index'
        },
        maze: {
            entry: 'src/maze.js',
            template: 'public/maze.html',
            filename: 'maze.html',
            title: 'maze'
        },
        guide: {
            entry: 'src/guide.js',
            template: 'public/guide.html',
            filename: 'guide.html',
            title: 'guide'
        }
    },
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                appId: 'hxppet',
                productName: '黄小胖',
                win: {
                    icon: './public/favicon256new.ico'
                },
                mac: {
                    icon: './public/Icon512.icns'
                }
           }
        }
    }
}