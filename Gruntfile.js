module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		watch: {
			sass: {
				files: ['src/oops-client/sass/**/*.scss'],
				tasks: 'compile-sass'
			},
			jade: {
				files: ['src/oops-client/templates/**/*.jade'],
				tasks: 'compile-jade'
			},
			copyserver : {
				files: ['src/oops-server/**/*.js'],
				tasks: 'copy-server'
			},
			copyclient : {
				files: ['src/oops-client/**/*.js'],
				tasks: 'copy-client'
			}
		},
		compass: {
			pc: {
				options: {
					sassDir: 'src/oops-client/sass',
					cssDir: 'public/css',
					javascriptsDir: 'public/js',
					imagesDir: 'public/img',
					fontsDir: 'public/fonts',
					app: 'stand_alone',
					outputStyle: 'nested',
					environment: 'development'
				}
			},
		},
		nodemon: {
			server: {
                                script: 'index.js',
                                options: {
                                        args: ['dev'],
                                        callback: function (nodemon) {
                                                nodemon.on('log', function (event) {
                                                  console.log(event.colour);
                                                });
                                              },
                                        nodeArgs: ['--debug'],
                                        ignore: ['Gruntfile.js', 'public/**/*js', 'src/oops-client/**/*js'],
                                        ext: 'js',
                                        delay: 1,
                                        env: {
                                                PORT: '8181'
                                        },
                                        cwd: __dirname
                                }
                        }

		},
		concurrent: {
			server: {
				tasks: ['nodemon:server', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
	
		},
		jade: {
			debug: {
				options: {
					client: true,
					compileDebug: true,
					amd: false,
					namespace: false,
					processName: function(filename) {
						return filename.replace('src/oops-client/templates/', '')
							.replace('.jade', '');
					}
				},
				files: {
					"public/views/templates.js": ["src/oops-client/templates/*.jade"],
				}
			},
			compile: {
				options: {
					client: true,
					compileDebug: false,
					amd: true,
					namespace: false,
					processName: function(filename) {
						return filename.replace('src/oops-client/templates/', '')
							.replace('.jade', '');
					}
				},
				files: {
					"public/js/views/templates.js": ["src/oops-client/templates/*.jade"]
				}

			}
		},
		copy: {
			client: {
				files: [
					{
						expand: true,
						cwd: 'src/oops-client/js',
						src: ['**/*.js', '!package.js', '!.~', '!.#*'],
						dest: 'public/js',
						filter: 'isFile'
					},
				      ]
			},
			server: {
				files: [
					{
						expand: true,
						cwd: 'src/oops-server/js',
						src: ['**/*.js', '!package.js', '!.~', '!.#*'],
						dest: 'lib/oops-server',
						filter: 'isFile'
					}
				      ]
			}
		},
		jshint: {
			all: ['src/**/*.js']
		},
		apidoc: {
			cmd: "../resources/ext/js-doc-parse/parse.sh config=../resources/profiles/config-js-doc-parse.js"
		}
	});

	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-concurrent')
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['compile-jade', 'compile-sass', 'copy:server', 'copy:client', 'concurrent:server', 'jshint:all']);
	grunt.registerTask('compile-jade', ['jade:compile']);
	grunt.registerTask('compile-sass', ['compass:pc']);
	grunt.registerTask('jshint-all', ['jshint:all'])
	grunt.registerTask('copy-server', ['copy:server']);
	grunt.registerTask('copy-client', ['copy:client']);
	grunt.registerTask('release', ['compass:release', 'jade:release']);
	grunt.registerTask('dbImport', ['concurrent:dbImport'])

};
