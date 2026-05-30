var helpers = require('./helpers.js');

exports.importInvoices = function(fileContent, profile) {
	var rows = helpers.parseCSV(fileContent);

	if (rows.length === 0) {
		return [];
	}

	// Timemator has no VAT info, so use the profile’s default VAT rate.
	var vatPercentage =
		profile && typeof profile.vatPercentage === 'number'
			? profile.vatPercentage
			: 0;

	// Rows without an hourly_rate fall back to the profile’s default hourly rate.
	var fallbackRate =
		profile && typeof profile.hourlyRate === 'number'
			? profile.hourlyRate
			: 0;

	// Group rows by folder (one invoice each), then by task (one line item each).
	var folders = {};

	rows.forEach(function(row) {
		var task = (row.task || '').trim();
		var date = (row.date || '').trim();
		if (!task || !date) return;

		var folder = (row.folder || '').trim();
		var duration = parseFloat(row.duration_decimal) || 0;
		var hourlyRate = parseFloat(row.hourly_rate);
		if (isNaN(hourlyRate)) hourlyRate = fallbackRate;

		if (!folders[folder]) {
			folders[folder] = { tasks: {}, dates: [] };
		}
		var group = folders[folder];
		group.dates.push(date);

		if (!group.tasks[task]) {
			group.tasks[task] = { totalHours: 0, hourlyRate: hourlyRate };
		}
		group.tasks[task].totalHours += duration;
	});

	// One invoice per folder, line items sorted by task name.
	return Object.keys(folders).sort().map(function(folder) {
		var group = folders[folder];
		group.dates.sort();

		var items = Object.keys(group.tasks).sort().map(function(task) {
			var t = group.tasks[task];

			return {
				description: task,
				quantity: helpers.round2(t.totalHours),
				unit: 'Hour',
				unitPrice: t.hourlyRate,
				vatPercentage: vatPercentage,
			};
		});

		var patch = {
			recipient: { name: folder },
			serviceDateStart: group.dates[0],
			items: items,
		};

		var lastDate = group.dates[group.dates.length - 1];
		if (lastDate !== group.dates[0]) {
			patch.serviceDateEnd = lastDate;
		}

		return patch;
	});
};
