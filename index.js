#!/usr/bin/env node
// code-format-config -t ts
const path = require('path')
const fs = require('fs')
const minimist = require('minimist')//命令行参数解析 http://quanzhan.applemei.com/webStack/TkRZNE1BPT0%3D
const chalk = require('chalk')//node终端样式库 https://blog.csdn.net/wu_xianqiang/article/details/117826860
const spawn = require('child_process').spawn;// http://quanzhan.applemei.com/webStack/TWpVM05BPT0=
//它可以实现创建多线程，并可实现主线程和子线程之间的通信。child_process模块中主要使用有两个方法spawn和exec，这两个方法都可以用来创建子线程。
const arg = minimist(process.argv.slice(2))
const system = process.platform === 'win32'
const type = arg.type || arg.t
const mode = arg.mode || arg.m || 'npm'
const help = arg.help || arg.h || false
const clear = arg.c || arg.clear || false
//readline是Node.js里实现标准输入输出的封装好的模块，通过这个模块我们可以以逐行的方式读取数据流。
//readline 模块提供了用于从可读流（例如 process.stdin）每次一行地读取数据的接口。 
//https://blog.csdn.net/qq_44872688/article/details/122546109
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

const jsNpm = [
    'babel-eslint@^10.0.0',
]

const tsNpm = [
    '@typescript-eslint/parser@^4.0.0',
    '@typescript-eslint/eslint-plugin@^4.0.0',
]

const npmlist = [
    'rimraf',
    '@saqqdy/prettier-config',
    'eslint@7',
    'eslint-config-rc',
    'eslint-plugin-import@^2.22.0',
    'eslint-plugin-react@^7.20.3',
    'eslint-plugin-react-hooks@^4.0.8',
    'eslint-plugin-jsx-a11y@^6.3.1',
    'stylelint-config-standard',
    'stylelint-config-rational-order',
    'stylelint-config-mixup',
    'stylelint@13',
    'stylelint-scss@3',
    'commitlint-config-gonzalo',
    '@commitlint/cli',
    'lint-staged',
    'husky@4',
]

const filenameList = [
    '.prettierrc.js',
    '.prettierignore',
    '.eslintrc.js',
    '.stylelintrc.js',
    '.stylelintignore',
    '.commitlintrc.js',
]
//process.cwd()方法是流程模块的内置应用程序编程接口，用于获取node.js流程的当前工作目录。
function createFile(filename, content) {
    fs.writeFileSync(path.join(process.cwd(), filename), content, {
        encoding: 'utf-8'
    })
}

function readFile(filename) {
    return fs.readFileSync(path.join(process.cwd(), filename), {
        encoding: 'utf-8'
    })
}
//同步版的 unlink() ，删除文件操作。
function deleteFiles(filenameList) {
    filenameList.forEach((item) => {
        try {
            fs.unlinkSync(path.join(process.cwd(), item))
        } catch (error) { }
    })
    console.log('delete ' + filenameList.join(' '))
}

function tnpmInstall(packageName, installType = 'install') {
    const tnpm = 'tnpm'
    const args = [installType, '--save-dev'].concat(packageName)
    const ls = spawn(system ? 'tnpm.cmd' : tnpm, args, {
        cwd: process.cwd()
    })
    console.log(`tnpm ${installType} --save-dev ` + packageName.join(' '))
    console.log(chalk.green(`${installType}...`))
    //stderr是标准错误流,和stdout的作用差不多,不同的是它是用来打印错误信息的
    //监听标准错误
    ls.stderr.on('data', function (data) {
        console.log(String(data).replace(/\n$/, ""))
    })
    ls.stderr.on('error', function (err) {
        console.error(chalk.red(err.toString()))
        if (installType === 'uninstall') { process.exit() }
    })
    // 子进程关闭事件
    ls.once('close', function () {
        console.log(chalk.green(`${installType} success...`))
        if (installType === 'install') {
            console.log('安装完成, 可以依次使用以下命令：')
            console.log(chalk.yellow('npm run lint'))
            console.log(chalk.yellow('npm run format'))
            console.log('检查无误后，提交代码')
            console.log(chalk.yellow('git add .'))
            console.log(chalk.yellow('git commit -m xxxxx'))
        }
        if (installType === 'uninstall') { process.exit() }

    })
}

const packgeJsonStr = readFile('package.json')
const packgeJson = JSON.parse(packgeJsonStr)

function backPackage() {
    console.log('back package')
    delete packgeJson["tnpm"]
    delete packgeJson.scripts["reboot"]
    delete packgeJson["lint-staged"]
    delete packgeJson["husky"]
    createFile('package.json', JSON.stringify(packgeJson, null, 2))
}

if (help) {
    console.log('必填：-t | -type => ts | js ; 描述: 项目使用： ts + react | js + react')
    console.log('选填：-m | -mode => npm | custom... ; 描述: 配置tnpm的mode')
    console.log('选填：-c | -clear ; 描述: 返回未配置之前的状态, 但是可能会删除掉之前已有的依赖，请谨慎使用!!!')
    console.log('选填：-h | -help ; 描述: 相关命令信息')
    process.exit();
}

if (clear) {
    readline.question(chalk.yellow(`此命令执行后，会返回未配置之前的状态, 但是可能会删除掉之前已有的依赖，请谨慎使用!!!
确定要执行clear命令吗? 请输入 yes or no\n`), name => {
        if (name.toLowerCase(name) === 'yes' || name === 'y' || name === 'Y') {
            backPackage()
            deleteFiles(filenameList)
            tnpmInstall(npmlist.concat(jsNpm, tsNpm), 'uninstall')
        }
        readline.close();
    });
} else {
    init()
}

function init() {
    if (!type) {
        console.log(chalk.red('The type parameter cannot be empty'))
        console.log('Please execute first: ' + chalk.yellow('-h | -help'))
        process.exit();
    }

    if (type && type !== 'ts' && type !== 'js') {
        console.log(chalk.red('type is not a correct parameter'))
        console.log('Please enter: ' + chalk.yellow('ts | js'))
        process.exit();
    }

    const npmNamelist = type === 'ts' ? npmlist.concat(tsNpm) : npmlist.concat(jsNpm)
    tnpmInstall(npmNamelist)
    createFile('.prettierrc.js', "module.exports = { ...require('@saqqdy/prettier-config') };")
    createFile('.prettierignore', '*build\n*target\ncoverage\ndist\nlib\n')

    if (type === 'ts') {
        createFile('.eslintrc.js', "module.exports = { extends: 'eslint-config-rc' };")
    }
    if (type === 'js') {
        createFile('.eslintrc.js', "module.exports = { extends: 'eslint-config-rc' };")
    }

    let gitignore = readFile('.gitignore')
    if (gitignore.indexOf('*cache\n') < 0 && gitignore.indexOf('\n*cache\n') < 0) {
        gitignore = gitignore + '\n*cache\n'
        createFile('.gitignore', gitignore)
    }

    createFile('.stylelintrc.js', "module.exports = { extends: ['stylelint-config-standard', 'stylelint-config-rational-order','stylelint-config-mixup'] };")
    createFile('.stylelintignore', '*.*\n!*.css\n!*.scss\n!*.less')
    createFile('.commitlintrc.js', "module.exports = { extends: ['commitlint-config-gonzalo'] };")

    if (!system) {
        packgeJson["tnpm"] = {
            "mode": mode,
            "lockfile": "enable"
        }
    }

    packgeJson.scripts["reboot"] = `rimraf node_modules package-lock.json ${system ? '&' : '&&'} tnpm install`

    packgeJson["lint-staged"] = {
        "*.{css,scss,less}": "stylelint --fix",
        "*.{js,jsx,ts,tsx}": "eslint --cache --fix",
        "**/*": "prettier --write --ignore-unknown"
    }

    packgeJson["husky"] = {
        "hooks": {
            "pre-commit": "lint-staged",
            "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
        }
    }

    createFile('package.json', JSON.stringify(packgeJson, null, 2))//,格式化json，每行缩进两个空格
}