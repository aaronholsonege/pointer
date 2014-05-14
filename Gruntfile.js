'use strict';

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
                files: ['src/**/*.js', 'Gruntfile.js'],
                tasks: ['build']
            }
        },

        browserify: {
            options: {
                entry: 'src/Bootstrap.js',
                postBundleCB: function(err, src, done) {
                    done(err, '(function() {\nvar ' + src + '\n}());');
                }
            },
            native: {
                files: {
                    'build/pointer.js' : ['src/Bootstrap.js']
                },
                options: {
                    alias: [
                        'src/adapters/event/Native.js:adapter/event',
                        'src/adapters/toucharea/Attribute.js:adapter/toucharea'
                    ]
                }
            },
            jquery: {
                files: {
                    'build/jquery.pointer.js' : ['src/Bootstrap.jquery.js']
                },
                options: {
                    entry: 'src/Bootstrap.jquery.js',
                    alias: [
                        'src/adapters/event/jQuery.js:adapter/event',
                        'src/adapters/toucharea/Attribute.js:adapter/toucharea'
                    ]
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
            options: {
            },
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
    grunt.registerTask('build', ['browserify', 'uglify', 'docs']);
};
