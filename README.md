# InDesign IDML Cleanup Helper

An ExtendScript for Adobe InDesign that rebuilds each open document through IDML and saves the result as a new INDD file, next to the original.

Use it as a recovery step when a document behaves unexpectedly and can still be opened and exported. It is not meant for every job.

- Video: https://youtu.be/j8rTg7q1X8I
- Written guide: https://www.linguist-coder.com/2026/01/scaling-multilingual-dtp-maintenance.html

## Install

1. Download `IDML_cleanupHelper.jsx` from the [latest release](https://github.com/linguist-coder/indesign-idml-cleanup/releases/latest).
2. In InDesign, open the Scripts panel (Window > Utilities > Scripts).
3. Right-click the User folder and choose Reveal in Explorer (Reveal in Finder on macOS).
4. Copy the file into that folder. It appears in the Scripts panel under User.

## Use

1. Open the documents you want to rebuild, and save them.
2. Double-click `IDML_cleanupHelper.jsx` in the Scripts panel.
3. Confirm the dialog. Choose No to stop without changing anything.
4. A report lists the new files and any skipped documents.

## What happens to each document

For each saved document without unsaved changes, the script:

1. Exports `name__idml_cleanup.idml` to the document's folder.
2. Closes the original without saving. The original `.indd` file is not changed.
3. Opens the IDML and saves it as `name__idml_cleaned.indd` in the same folder.
4. Closes the new copy.

Details:

- An existing `name__idml_cleanup.idml` is overwritten without another prompt.
- If `name__idml_cleaned.indd` already exists, the new copy gets a date and time in its name (`name__idml_cleaned_YYYYMMDD_HHMMSS.indd`).
- A document that has never been saved is skipped and listed as `(not saved)`.
- A document with unsaved changes is skipped and listed as `(unsaved changes - save first)`. Documents opened from or added to a book can be marked as changed, so save them before running the script.
- Links keep the same file paths. A missing link stays missing in the new copy.
- Dialogs such as the missing-link warning are suppressed during the run. The previous setting is restored at the end, even if an error occurs.
- If a document fails, it is listed with the error message and the script continues with the next one.

An IDML round trip can change line breaks and spacing. Compare the new copy with the original before you replace anything.

## Tested with

Adobe InDesign 2026 (21.6) on Windows. Not tested on macOS.

## Custom scripts

Need a script for your own InDesign or Illustrator task? See [Work with me](https://www.linguist-coder.com/work-with-me.html).

## License

MIT. See [LICENSE](LICENSE).
