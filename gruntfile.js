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
		}
	});

	//Load plugins
	grunt.loadNpmTasks('grunt-browser-sync');
	//Register Tasks
	grunt.registerTask('default', ['browserSync:dev']);
};