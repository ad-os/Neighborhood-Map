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
		}
	});

	//Load plugins
	grunt.loadNpmTasks('grunt-browser-sync');
	grunt.loadNpmTasks('grunt-responsive-images');
	//Register Tasks
	grunt.registerTask('default', ['browserSync:dev']);
	grunt.registerTask('build', ['responsive_images:dev']);
};