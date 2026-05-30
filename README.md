# Timemator Importer for [Billy](https://usebilly.app)

A [Billy](https://usebilly.app) plugin that turns a [Timemator](https://timemator.com) CSV export into invoices—one invoice per client, with your tracked time rolled up into line items.

## What it Does

- **One invoice per client.** Entries are grouped by Timemator’s `folder` column, so a single export covering several clients produces a separate invoice for each.
- **One line item per task.** Within each client, entries are grouped by `task`; their hours are summed into a single `Hour` line item.
- **Unit price from your rate.** Each line item uses the task’s `hourly_rate`. When a row has no `hourly_rate`, it falls back to your profile’s default hourly rate.
- **VAT from your profile.** Line items use your profile’s default VAT rate.
- **Service period.** Each invoice’s service dates span the earliest and latest entry for that client.

Invoice number, sender details, currency, and payment terms come from your active Billy profile—exactly as if you’d hit **New Invoice**.

## Install

1. In Billy, open **Settings → Plugins**.
2. Click **Add Plugin…** and select the `Timemator Import.billyplugin` folder—or just drag it onto the list.

## Use

1. In Timemator, export the entries you want to bill as a **CSV**. Make sure **Revenue** is enabled in the export options—Timemator only includes the rate column when it’s turned on, and without it your line items fall back to the profile’s default hourly rate.
2. In Billy, choose **Profiles → Import Invoices… → Timemator Import**.
3. Pick one or more CSV files. Billy creates the invoices as drafts for you to review.

## CSV Format

The plugin reads Timemator’s standard CSV export. Columns may be separated by **either commas or semicolons** (auto-detected). It uses these columns:

| Column            | Required | Used for                                  |
| ----------------- | -------- | ----------------------------------------- |
| `folder`          | no       | Client name (recipient); groups invoices  |
| `task`            | yes      | Line item description; groups line items  |
| `date`            | yes      | Service date range                        |
| `duration_decimal`| yes      | Hours (line item quantity)                |
| `hourly_rate`     | no       | Unit price (falls back to profile)        |

Rows missing a `task` or `date` are skipped.

## Building / Contributing

This folder is also a worked example for the Billy [plugin specification](https://usebilly.app/support/plugin-spec) for the full plugin API, and [`main.js`](./main.js) / [`helpers.js`](./helpers.js) for the implementation.
