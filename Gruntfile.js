'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var rdefineEnd = /}\);[^}\w]*$/;
    var namespace = 'Pointer';

    // strip out amd stuffs from build
    function convert( name, path, contents ) {

        if (name === 'Pointer') {
            contents = contents
                .replace(/define\('(.[^']+)'[^{]*?{/, '')
                .replace(rdefineEnd, '');
        } else {
            // Remove define wrappers, closure ends, and empty declarations
            contents = contents
                .replace(/define\('(.[^']+)'[^{]*?{/, namespace + '.$1 = (function() {')
                .replace(rdefineEnd, '}());\n');
        }
        // Remove empty definitions
        contents = contents
            .replace(/\srequire\('(.[^']+)'\)/g, ' ' + namespace + '.$1')
            .replace(/define\(\[[^\]]+\]\);?[\W\n]+$/, '');

        return contents;
    }

    // Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            options: {
                optimize: 'none',
                baseUrl: 'src',
                name: 'Pointer',
                wrap: {
                    start: '(function() {\nvar Pointer = {};\n',
                    end: '}());'
                },
                out: 'build/pointer.js',
                onBuildWrite: convert
            },
            native: {
                options: {
                    paths: {
                        Adapter: 'adapters/NativeAdapter'
                    },
                    out: 'build/pointer.js'
                }
            },
            jquery: {
                options: {
                    paths: {
                        Adapter: 'adapters/jQueryAdapter'
                    },
                    out: 'build/jquery.pointer.js'
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
    grunt.registerTask('build', ['requirejs', 'uglify']);
};
