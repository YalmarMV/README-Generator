
import path from 'path';
import fs from 'fs'
import template from 'es6-template-strings';
import * as macros from "./macros";

function toMarkdown(templateContents, data) {

    let boundMacros = {};
    Object.keys(macros).forEach((key, idx) => {
      boundMacros[key] = options => (macros[key] || function(){ return '';})(options, scope);
    });
    let scope = { ...data, ...boundMacros};
    let markdown = template(templateContents, scope);
    return markdown;
}


function compile(userPath, fallbackPath, cb) {
    let userTemplate = path.join(process.cwd(), userPath);
    fs.exists(userTemplate, function (exists) {
        let sourceTemplate = exists ? userTemplate : fallbackPath ? fallbackPath : null;
        if (sourceTemplate) {
            fs.readFile(sourceTemplate, function (err, contents) {
                if (err) {
                    throw 'cannot read ' + sourceTemplate;
                }
                let data = {
                    pkg: require(path.join(process.cwd(), 'package.json'))
                };
                cb(toMarkdown(contents, data));
            });
            return;
        }
        cb();
    });
}

function createReadme(overwrite=true) {
    compile('.README.md', path.join(__dirname, './.README.md'), function(markdown) {
        let destination = path.join(process.cwd(), './README.md');
        fs.exists(destination, function (exists) {
            if (exists && !overwrite) {
                throw destination + ' already exists';
            }
            fs.writeFile(destination, markdown, function (err) {
              if (err) throw err;
              console.log('README.md created');
            });
        });
    });
}

export default {
    generate: createReadme
};
