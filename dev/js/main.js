$(document).ready(function() {
	$('.open-video').magnificPopup({
      type: 'iframe',
      mainClass: 'my-mfp-slide-bottom',
      removalDelay: 160,
      preloader: false,
      fixedBgPos: true,
      fixedContentPos: true
    });
    $(".main-nav__mobile").click(function(event) {
    	event.preventDefault();
    	$(".main-nav__list").toggleClass('active');
    });
});