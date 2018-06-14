$('main').on('click', '.about', (e) => {
	const message = '<span>On My Plate!</span>A food journal that lets you record what you eat everyday!';
	const template = `<div>
											<button class="about-close"><i class="icon-close"></i></button>
											<p>${message}</p>
										</div>`;
	$('.about-container').html(template);
	$('.about-container').addClass('expand');
});

$('main').on('click', '.about-close', (e) => {
	$('.about-container').html('<button class="about">About</button>');
	$('.about-container').removeClass('expand');
});