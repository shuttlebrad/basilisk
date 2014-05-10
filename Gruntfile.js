module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts: {
            build: {                       // a particular target
                src: ["src/**/*.ts"],      // The source typescript files, http://gruntjs.com/configuring-tasks#files
                outDir: 'build',           // If specified, the generate javascript files are placed here. Only works if out is not specified
                options: {                 // use to override the default options, http://gruntjs.com/configuring-tasks#options
                    target: 'es3',         // 'es3' (default) | 'es5'
                    module: 'commonjs',         // 'amd' (default) | 'commonjs'
                    sourceMap: false,       // true (default) | false
                    declaration: true,     // true | false (default)
                    removeComments: false  // true (default) | false
                }
            },
            buildamdtests: {                       // a particular target
                src: ["src/tests/**/*.ts"],      // The source typescript files, http://gruntjs.com/configuring-tasks#files
                outDir: 'build-amd/',           // If specified, the generate javascript files are placed here. Only works if out is not specified
                options: {                 // use to override the default options, http://gruntjs.com/configuring-tasks#options
                    target: 'es3',         // 'es3' (default) | 'es5'
                    module: 'amd',         // 'amd' (default) | 'commonjs'
                    sourceMap: false,       // true (default) | false
                    declaration: true,     // true | false (default)
                    removeComments: false  // true (default) | false
                }
            }
        },

        connect: {
            test : {
                port : 8000
            }
        },
        jasmine: {
            taskName: {
                options: {
                    specs: 'build-amd/tests/*.test.js',
                    host: 'http://127.0.0.1:8000/',
                    outfile: 'build-amd/tests/_SpecRunner.html',
                    keepRunner: true,
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: '/build-amd/tests'
                        }
                    }
                }
            }
        },
        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: true,
                extensions: 'js',
                specNameMatcher: 'test',
                jUnit: {
                    report: true,
                    savePath : "./build/reports/jasmine/",
                    useDotNotation: true,
                    consolidate: true
                }
            },
            all: ['build/tests/']
        },

        umd: {
            all: {
                src: 'build/basilisk.js',
                dest: 'build-amd/basilisk.js',

                // if missing the templates/umd.hbs file will be used
                template: 'unit',
                globalAlias: 'basilisk',
                objectToExport: 'exports',
                indent: '  '
            }
        },

        copy: {
            main: {
                files: [
                    { expand:true, src: 'build-amd/basilisk.js', dest: 'dist/', rename: function (dest, src) { return dest + 'basilisk.amd.js'; } },
                    { expand:true, src: 'build/basilisk.js', dest: 'dist/', rename: function (dest, src) { return dest + 'basilisk.commonjs.js'; } }

                ]

            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-umd');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('default', 'test');

    grunt.registerTask('build', ['ts:build', 'ts:buildamdtests', 'umd']);

    grunt.registerTask('test', ['build', 'jasmine_node', 'ts:buildamdtests', 'connect:test', 'jasmine']);
    grunt.registerTask('dist', ['test', 'copy'])
};