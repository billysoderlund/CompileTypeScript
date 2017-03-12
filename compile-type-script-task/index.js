"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const task = require("vsts-task-lib/task");
const path = require("path");
function installTypeScript(taskPath) {
    let npm = task.tool(task.which('npm', true));
    npm.arg('install').arg('--prefix').arg(taskPath).arg('typescript');
    return npm.execSync();
}
function startCompilation(tsc, projectPath) {
    console.log('Starting compilation...');
    let result = compile(tsc, projectPath);
    task.debug('tsc exited with code: ' + result.code);
    if (result.error) {
        task.debug('tsc exited with error: ' + result.error);
    }
    if (result.code === 0) {
        console.log('Compilation completed');
    }
    else {
        throw new Error('Compilation failed');
    }
}
function compile(tsc, projectPath) {
    let compiler = task.tool(task.which('node', true));
    compiler.arg(tsc).arg('-p').arg(projectPath);
    return compiler.execSync();
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let projectPath = task.getPathInput('projectPath', false, false);
            if (!task.exist(projectPath)) {
                throw new Error('Project path does not exist. Specify a path to a valid tsconfig.json file or directory containing the tsconfig.json file.');
            }
            let stats = task.stats(projectPath);
            if (stats.isFile()) {
                if (!(path.basename(projectPath) === 'tsconfig.json')) {
                    throw new Error('Project path \'' + projectPath + '\' is not a tsconfig.json file.');
                }
            }
            let tsc = path.join(__dirname, '/node_modules/typescript/lib/tsc.js');
            task.debug('tsc=' + tsc);
            console.log('Starting TypeScript installation...');
            let result = installTypeScript(__dirname);
            task.debug('npm install typescript exited with code: ' + result.code);
            if (result.code === 0) {
                if (task.exist(tsc)) {
                    console.log('TypeScript installation completed');
                    startCompilation(tsc, projectPath);
                }
                else {
                    task.debug('tsc not found after installation');
                    throw new Error('TypeScript installation failed');
                }
            }
            else {
                task.debug('typescript installation failed');
                throw new Error('TypeScript installation failed');
            }
            task.setResult(task.TaskResult.Succeeded, 'TypeScript compiler completed successfully');
        }
        catch (error) {
            task.setResult(task.TaskResult.Failed, error.message);
        }
    });
}
run();