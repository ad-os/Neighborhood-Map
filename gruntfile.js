module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserSync: {
			dev: {
				bsFiles: {
					src : [
						'css/*.css',
						'*.html',
						'js/*.js'
					]
				},
				options: {
					server: {
						baseDir: './'
					}
				}
			}
		},

		responsive_images: {
			dev: {
				options: {
					engine: 'im',
					sizes: [{
						width: 56,
						suffix: '-small',
						quality: 99
					}]
				},
				files: [{
					expand: true,
					src: ['button.svg'],
					cwd: 'img/',
					dest: 'img/'
				}]
			}
		},
		//inline css
		critical: {
			test: {
				options: {
					base: './',
					css: [
						'css/main.css'
					]
				},
				src: 'index.html',
				dest: 'index.html'
			}
		},
		//uglify js
		uglify: {
			build: {
				src: 'js/app.js',
				dest: 'js/app.js'
			},
			dev: {
				options: {
					beautify: true,
					mangle: false,
					compress: true,
					preserveComments: 'all'
				},
				src: 'js/app.js',
				dest: 'js/app.js'
			}
		},
		// uglify html 
		htmlmin: {                                    
			dist: {                                     
				options: {                                 
					removeComments: true,
					collapseWhitespace: true
				},
				files: {                                   
					'index.html': 'index.html',
				}
			}
		}		
	});

	//Load plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-critical');
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-responsive-images');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	//Register Tasks
	grunt.registerTask('default', ['browserSync:dev']);
	grunt.registerTask('build', ['responsive_images:dev']);
	grunt.registerTask('minifyjs', ['uglify:build']);
	grunt.registerTask('minifyhtml', ['htmlmin']);
	grunt.registerTask('minifycss', ['critical:test']);
};