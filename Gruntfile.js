'use strict';
var fs = require('fs');
var amdclean = require('amdclean');

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    // Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            options: {
                event: 'all',
                livereload: true
            },
            scripts: {
                files: ['src/**/**', 'Gruntfile.js'],
                tasks: ['build']
            }
        },

        requirejs: {
            options: {
                pragmas: {
                    jquery: false
                },
                baseUrl: 'src',
                insertRequire: ['Bootstrap', 'Bootstrap.jquery'],
                mainConfigFile: 'src/config.js',
                useStrict: false,
                optimize: 'none',
                // Strip AMD
                onModuleBundleComplete: function(data) {
                    fs.writeFileSync(data.path, amdclean.clean({
                        filePath: data.path,
                        prefixMode: 'camelCase'
                    }));
                }
            },
            native: {
                options: {
                    name: 'Bootstrap',
                    out: 'build/pointer.js',
                    paths: {
                        'adapter/event': 'adapters/event/Native',
                        'adapter/toucharea': 'adapters/toucharea/Attribute'
                    }
                }
            },
            jquery: {
                options: {
                    pragmas: {
                        jquery: true
                    },
                    name: 'Bootstrap.jquery',
                    out: 'build/jquery.pointer.js',
                    paths: {
                        'adapter/event': 'adapters/event/jQuery',
                        'adapter/toucharea': 'adapters/toucharea/Attribute'
                    }
                }
            }
        },

        yuidoc: {
            compile: {
                name: '<%= pkg.title %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: './src/',
                    outdir: './documentation/',
                    themedir: "./tools/yuidoc-themes/friendly"
                }
            }
        },

        uglify: {
            clean: {
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: '*pointer.js',
                    dest: 'build'
                }],
                options: {
                    mangle: false,
                    beautify: true,
                    compress: false
                }
            },
            build: {
                options: {
                    wrap: true
                },
                files: [{
                    expand: true,
                    cwd: 'build',
                    src: '*pointer.js',
                    ext: '.min.js',
                    dest: 'build',
                    extDot: 'last'
                }]
            }
        }
    });

    // Tasks
    grunt.registerTask('default', ['build']);

    grunt.registerTask('start', ['build', 'watch']);
    grunt.registerTask('docs', ['yuidoc']);
    grunt.registerTask('build', ['requirejs', 'uglify', 'docs']);
};
