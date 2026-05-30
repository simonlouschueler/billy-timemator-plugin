/**
 * Parse a delimited CSV string (Timemator’s export) into an array of
 * plain objects keyed by the header row.
 *
 * Handles:
 *  - Comma or semicolon delimiter (auto-detected from the header row)
 *  - Optional double-quoted fields (strips surrounding quotes)
 *  - Skips blank lines
 */
exports.parseCSV = function(text) {
	var lines = text.split(/\r?\n/);
	var delimiter = detectDelimiter(lines[0]);

	var headers = splitLine(lines[0], delimiter);
	var rows = [];

	for (var i = 1; i < lines.length; i++) {
		var line = lines[i].trim();
		if (!line) continue;

		var values = splitLine(line, delimiter);
		var row = {};
		headers.forEach(function(header, index) {
			row[header.trim()] = (values[index] || '').trim();
		});
		rows.push(row);
	}

	return rows;
};

/**
 * Round to 2 decimal places to avoid floating-point noise
 * (e.g. 2.9999999 → 3.00).
 */
exports.round2 = function(value) {
	return Math.round(value * 100) / 100;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

// Picks whichever of ; or , appears more often in the header row, defaulting
// to ; (Timemator’s default) when neither is present.
function detectDelimiter(headerLine) {
	var semicolons = (headerLine.match(/;/g) || []).length;
	var commas = (headerLine.match(/,/g) || []).length;
	return commas > semicolons ? ',' : ';';
}

function splitLine(line, delimiter) {
	var fields = [];
	var current = '';
	var inQuotes = false;

	for (var i = 0; i < line.length; i++) {
		var ch = line[i];

		if (ch === '"') {
			inQuotes = !inQuotes;
		} else if (ch === delimiter && !inQuotes) {
			fields.push(current);
			current = '';
		} else {
			current += ch;
		}
	}
	fields.push(current);
	return fields;
}
