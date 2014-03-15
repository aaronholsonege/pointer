'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    // Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            options: {
                entry: 'src/Pointer.js'
            },
            native: {
                files: {
                    'build/pointer.js' : ['src/Pointer.js']
                },
                options: {
                    alias: ['src/adapters/NativeAdapter.js:Adapter']
                }
            },
            jquery: {
                files: {
                    'build/jquery.pointer.js' : ['src/Pointer.js']
                },
                options: {
                    alias: ['src/adapters/jQueryAdapter.js:Adapter']
                }
            }
        },

        uglify: {
            options: {
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
        },

        watch: {
            options: {
                event: 'all',
                livereload: true
            },
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['build']
            }
        }
    });

    // Tasks
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['browserify', 'uglify']);
};
