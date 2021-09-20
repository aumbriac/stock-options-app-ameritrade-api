const getDates = async (s, d) => {
	await $.get(`get_data.php`, { symbol: s, date: d, contractType: 'ALL' }, (res) => {
		data = JSON.parse(res);
	})
	return data;
}
const showLoading = () => {
	$(`body`).append(`
		<div class="loader">
			<svg class="circular" viewBox="25 25 50 50">
			<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
			</svg>
		</div>`);
}
const removeLoading = () => {
	$(`.loader`).remove();
}
$(() => {
	$(`#symbol-form`).submit(async (e) => {
		e.preventDefault();
		$(`#submit`).attr('disabled', true);
		showLoading();
		if ($(`#select-container`).is(':visible')){
			$(`#select-container`).addClass('d-none');
		}
		const symbol = $(`#symbol-input`).val().toUpperCase();
		const data = await getDates(symbol, null);
		$.map(data.callExpDateMap, (val, idx) => {
			idx = idx.substr(0, 10);
			$(`#date`).append(`<option>${idx}</option>`);
		})
		$(`#select-container`).removeClass('d-none');
		removeLoading();
		$(`#submit`).attr('disabled', false);
	})

	$(`#go`).click(async (e) => {
		const symbol = $(`#symbol-input`).val().toUpperCase();
		const date = $(`#date`).val();
		const contractType = $(`#contract-type`).val();
		const data = await getDates(symbol, date);
		window.location = `./options?symbol=${symbol}&date=${date}&contractType=${contractType}`;
	})
})
