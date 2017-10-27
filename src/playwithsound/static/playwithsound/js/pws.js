$(document).ready(function() {
    $('#fullpage').fullpage({
    	sectionsColor: ['#b4d5c4', '#75b9bd', '#b4d5c4'],
    	lockAnchors: false,
		anchors:['secAbout', 'secMode', 'secGallery'],
    	navigation: true,
		navigationPosition: 'right',
		navigationTooltips: ['About PWS', 'Play Mode', 'Browse Gallery'],
		slidesNavigation: true
    });
});