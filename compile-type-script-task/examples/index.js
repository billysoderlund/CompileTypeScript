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
let npmPrefix = 'compile-type-script-task';
function installTypeScript() {
    let npm = task.tool(task.which('npm', true));
    npm.arg('install').arg('--prefix').arg(npmPrefix).arg('typescript');
    return npm.execSync();
}
function startCompilation(tsc) {
    console.log('Starting compilation...');
    let result = compile(tsc);
    task.debug('tsc exited with code: ' + result.code);
    if (result.code === 0) {
        console.log('Compilation completed');
    }
    else {
        throw new Error('Compilation failed');
    }
}
function compile(tsc) {
    let compiler = task.tool(tsc);
    return compiler.execSync();
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let cwd = task.getPathInput('cwd', false, false);
            cwd = 'compile-type-script-task/tests';
            task.debug('cwd=' + cwd);
            let tsc = npmPrefix + '/node_modules/typescript/bin/tsc';
            task.debug('tsc=' + tsc);
            task.cd(cwd);
            if (!task.exist(tsc)) {
                console.log('Starting TypeScript installation...');
                let result = installTypeScript();
                task.debug('npm install typescript exited with code: ' + result.code);
                if (result.code === 0) {
                    if (task.exist(tsc)) {
                        console.log('TypeScript installation completed');
                        startCompilation(tsc);
                    }
                    else {
                        task.debug('tsc not found after installation');
                        throw new Error('TypeScript installation failed. Try to manually install TypeScript on the agent.');
                    }
                }
                else {
                    task.debug('typescript installation failed');
                    throw new Error('TypeScript installation failed. Try to manually install TypeScript on the agent.');
                }
            }
            else {
                startCompilation(tsc);
            }
            task.setResult(task.TaskResult.Succeeded, 'TypeScript compiler completed successfully');
        }
        catch (error) {
            task.setResult(task.TaskResult.Failed, error.message);
        }
    });
}
run();
