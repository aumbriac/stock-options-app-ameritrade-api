const urlParams = new URLSearchParams(window.location.search);
let symbol = urlParams.get('symbol');
let date = urlParams.get('date');
let contractType = urlParams.get('contractType');
let timer;

const renderCell = (header, idx, cellData) => {
	idx = idx.replace('.', '_');
	cellData = checkNaN(cellData);
	$(`#table-row-${idx.replace('.', '_')}`).append(`<td class="call-${header}-${idx}"><span class="fw-bold">${header}</span><div class="call-${header}-${idx}-data">${cellData}</div></td>`);
}

const updateCell = (header, idx, cellData) => {
	idx = idx.replace('.', '_');
	let currentValue = $(`.call-${header}-${idx}-data`).text();
	cellData = checkNaN(cellData);
	if (!isNaN(currentValue) && !isNaN(cellData)){
		$(`.call-${header}-${idx}`).html(`<span class="fw-bold">${header}</span><div class="call-${header}-${idx}-data">${cellData}</div>`);
		if (parseFloat(currentValue) > parseFloat(cellData)) {
			$(`.call-${header}-${idx}-data`).css('color', 'red');
		} else if (parseFloat(currentValue) < parseFloat(cellData)) {
			$(`.call-${header}-${idx}-data`).css('color', 'green');
		}
	}
}

const beginRow = (idx, strikePrice, currentPrice) => {
	if (contractType === 'CALL'){
		if (strikePrice < currentPrice) {
			$(`table`).append(`<tr class="bg-secondary" id="table-row-${idx.replace('.', '_')}">`);
		} else {
			$(`table`).append(`<tr class="bg-black" id="table-row-${idx.replace('.', '_')}">`);
		}
	} else if (contractType === 'PUT'){
		if (strikePrice > currentPrice) {
			$(`table`).append(`<tr class="bg-secondary" id="table-row-${idx.replace('.', '_')}">`);
		} else {
			$(`table`).append(`<tr class="bg-black" id="table-row-${idx.replace('.', '_')}">`);
		}
	}
}

const endRow = () => {
	$(`table`).append(`</tr>`);
}

const thousandsFormat = num => {
	return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(2)) + 'K' : Math.sign(num) * Math.abs(num)
}

const checkNaN = num => {
	return num == 'NaN' || num == '0' ? '-' : num;
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

const getData = async () => {

	await $.get(`get_data.php`, { symbol: symbol, date: date, contractType: contractType }, (res) => {
		data = JSON.parse(res);
		if (data.status === 'FAILED'){
			$(`#alert`).removeAttr('hidden');
		}
	})
	return data;
}

const renderSelect = async () => {
	let dateMap;
	await $.get(`get_data.php`, { symbol: symbol, contractType: contractType }, (res) => {
		data = JSON.parse(res);
		switch (contractType) {
			case 'CALL':
				dateMap = data.callExpDateMap;
				break;
			case 'PUT':
				dateMap = data.putExpDateMap;
				break;
		}
		$.map(dateMap, (val, idx) => {
			idx = idx.substr(0, 10);
			if (idx === date) {
				$(`#select-date`).append(`<option selected>${date}</option>`);
			} else {
				$(`#select-date`).append(`<option>${idx}</option>`);
			}
		})
	})
}

const renderTable = async () => {
	
	const data = await getData();
	let price = data.underlyingPrice.toFixed(2);
	$(`#price`).text(price)

	switch (contractType) {
		case 'CALL':
			dateMap = data.callExpDateMap;
		break;
		case 'PUT':
			dateMap = data.putExpDateMap;
		break;
	}
	// let maxVolumeArray = [],
	// 	maxVolume;
	// Object.values(dateMap).map((val, idx) => {
	// 	$.map(val, (v, i) => {
	// 		maxVolumeArray.push(v[idx].totalVolume)
	// 	})
	// 	maxVolume = Math.max(...maxVolumeArray);
	// })
	

	$.map(dateMap, (val, idx) => {
		
		let date = idx.substr(0, 10);
		// Date header
		$(`table`).append(`<tr><th class="date-row" colspan="100%">${date}</th></tr>`);
		$.map(val, (val, idx) => {
				beginRow(idx, val[0].strikePrice, price);
				renderCell(`strike`, idx, val[0].strikePrice);
				renderCell(`volume`, idx, thousandsFormat(val[0].totalVolume));
				renderCell(`oi`, idx, thousandsFormat(val[0].openInterest));
				renderCell(`mark`, idx, (val[0].mark * 100).toFixed(2));
				renderCell(`bid`, idx, (val[0].bid * 100).toFixed(2));
				renderCell(`ask`, idx, (val[0].ask * 100).toFixed(2));
				renderCell(`volatility`, idx, checkNaN(val[0].volatility));
				renderCell(`delta`, idx, checkNaN(val[0].delta));
				renderCell(`gamma`, idx, checkNaN(val[0].gamma));
				renderCell(`theta`, idx, checkNaN(val[0].theta));
				renderCell(`vega`, idx, checkNaN(val[0].vega));
				renderCell(`rho`, idx, checkNaN(val[0].rho));
		})
	});
}

const updateTable = async () => {
	
	let data = await getData(),
		price = data.underlyingPrice.toFixed(2),
		oldPrice = parseFloat($(`#price`).text());
	$(`#price`).text(price);
	if (oldPrice > price){
		$(`#price`).css('color', 'red')
	} else if (price > oldPrice) {
		$(`#price`).css('color', 'green')
	} else {
		$(`#price`).css('color', 'white')
	}

	document.title = `${symbol} ${price}`;
		$.map(data.callExpDateMap, (val, idx) => {
			let date = idx.substr(0, 10);

		// Map through data stored within each call expiration date
			// let strikePrice = idx, val[0].strikePrice.toString();
			$.map(val, (val, idx) => {
				if (val[0].strikePrice < price){
					// alert(val[0].strikePrice + ' is less than ' + price)
				}
				updateCell(`volume`, idx, thousandsFormat(val[0].totalVolume));
				updateCell(`oi`, idx, thousandsFormat(val[0].openInterest));
				updateCell(`mark`, idx, (val[0].mark * 100).toFixed(2));
				updateCell(`bid`, idx, (val[0].bid * 100).toFixed(2));
				updateCell(`ask`, idx, (val[0].ask * 100).toFixed(2));
				updateCell(`volatility`, idx, checkNaN(val[0].volatility));
				updateCell(`delta`, idx, checkNaN(val[0].delta));
				updateCell(`gamma`, idx, checkNaN(val[0].gamma));
				updateCell(`theta`, idx, checkNaN(val[0].theta));
				updateCell(`vega`, idx, checkNaN(val[0].vega));
				updateCell(`rho`, idx, checkNaN(val[0].vega));

			// callStrikePriceArray.push(idx);
			// callVolumeArray.push(thousandsFormat(val[0].totalVolume));
			// maxCallVolume = Math.max(...callVolumeArray);
			// if (maxCallVolume == val['totalVolume']) {
			// 	topCallOption = val;
			// 	topCallOptionStrikePrice = idx;
			// }
		})
	})
}



$(async () => {
	showLoading();

	switch (contractType) {
		case 'CALL':
			$('#contract-type-select').val('CALL');
			$('#contract-type-select').css('color', 'green')
			break;
		case 'PUT':
			$('#contract-type-select').val('PUT');
			$('#contract-type-select').css('color', 'red')
			break;
		default:
			window.location = './index.html';
			break;
	}

	$(`#symbol`).text(symbol);
	await renderSelect();
	await renderTable()

	removeLoading();
	dateInput = $(`#select-date`).val();
	
	timer = setInterval(() => {
		updateTable();
	}, 1000);

	// User Actions
	$(`#select-date`).change((e) => {
		let date = $(e.target).val();
		window.location = `./options?symbol=${symbol}&date=${date}&contractType=${contractType}`;
	})
	$(`#contract-type-select`).change((e) => {
		window.location = `./options?symbol=${symbol}&date=${date}&contractType=${e.target.value}`;
	})
	$(`#symbol-search-form`).submit(async (e) => {
		e.preventDefault();
		let symbolInput = $(`#symbol-input`).val();
		await $.get(`get_data.php`, { symbol: symbolInput, contractType: contractType }, (res) => {
			data = JSON.parse(res);
			switch (contractType) {
				case 'CALL':
					dateMap = data.callExpDateMap;
					break;
				case 'PUT':
					dateMap = data.putExpDateMap;
					break;
			}
		});
		let dateInput = Object.keys(dateMap)[0].substr(0, 10);
		window.location = `./options?symbol=${symbolInput}&date=${dateInput}&contractType=${contractType}`;
	})
})

