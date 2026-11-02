#target indesign

(function () {
    var docs = app.documents;

    if (docs.length === 0) {
        alert("No documents are currently open.");
        return;
    }

    var proceed = confirm(
        "This will export each saved document to IDML, reopen it, and save a cleaned copy as a new INDD file.\n\n" +
        "Documents with unsaved changes will be skipped. Save them first.\n" +
        "Original files will NOT be overwritten.\n" +
        "IDML files will be kept for troubleshooting.\n\n" +
        "Continue?"
    );
    if (!proceed) return;

    var results = [];
    var skipped = [];

    // Suppress blocking dialogs during batch processing
    var oldLevel = app.scriptPreferences.userInteractionLevel;
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

    try {
        // Close() happens inside the loop -> iterate backwards to avoid index shifts
        for (var i = docs.length - 1; i >= 0; i--) {
            try {
                var doc = docs[i];

                if (!doc.saved) {
                    skipped.push(doc.name + " (not saved)");
                    continue;
                }

                // Unsaved changes would go into the cleaned copy but not the original
                if (doc.modified) {
                    skipped.push(doc.name + " (unsaved changes - save first)");
                    continue;
                }

                var originalFile = doc.fullName;           // File
                var originalFolder = originalFile.parent;  // Folder
                var baseName = stripInddExtension(originalFile.name);

                // Output paths (same folder to preserve link behavior as much as possible)
                var idmlFile = new File(originalFolder.fsName + "/" + baseName + "__idml_cleanup.idml");

                // If a cleaned file already exists, add timestamp to avoid collision
                var cleanedInddFile = new File(originalFolder.fsName + "/" + baseName + "__idml_cleaned.indd");
                if (cleanedInddFile.exists) {
                    cleanedInddFile = new File(
                        originalFolder.fsName + "/" + baseName + "__idml_cleaned_" + timestamp() + ".indd"
                    );
                }

                // 1) Export IDML
                doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile, false);

                // 2) Close original without saving (non-destructive)
                doc.close(SaveOptions.NO);

                // 3) Open IDML (attempt hidden open if supported)
                var reopened;
                try {
                    reopened = app.open(idmlFile, false);
                } catch (_) {
                    reopened = app.open(idmlFile);
                }

                // 4) Save as new INDD (do not overwrite original)
                reopened.save(cleanedInddFile);

                // 5) Close cleaned doc
                reopened.close(SaveOptions.YES);

                results.push(baseName + " -> " + cleanedInddFile.fsName);

            } catch (e) {
                skipped.push(safeDocNameAtIndex(i, docs) + " (error: " + e.message + ")");
                continue;
            }
        }
    } finally {
        // Always restore interaction level
        app.scriptPreferences.userInteractionLevel = oldLevel;
    }

    // Report
    var msg = [];
    msg.push("Completed.\n");

    if (results.length > 0) {
        msg.push("[Cleaned copies created]");
        for (var r = 0; r < results.length; r++) msg.push("- " + results[r]);
        msg.push("");
    }

    if (skipped.length > 0) {
        msg.push("[Skipped]");
        for (var s = 0; s < skipped.length; s++) msg.push("- " + skipped[s]);
        msg.push("");
    }

    msg.push("Note: Always verify (diff/QA) before replacing originals.");
    alert(msg.join("\n"));

    // ---- helpers ----

    function stripInddExtension(name) {
        return name.replace(/\.indd$/i, "");
    }

    function timestamp() {
        // YYYYMMDD_HHMMSS
        var d = new Date();
        return (
            d.getFullYear() +
            pad2(d.getMonth() + 1) +
            pad2(d.getDate()) + "_" +
            pad2(d.getHours()) +
            pad2(d.getMinutes()) +
            pad2(d.getSeconds())
        );
    }

    function pad2(n) {
        return (n < 10) ? ("0" + n) : ("" + n);
    }

    function safeDocNameAtIndex(idx, collection) {
        try { return collection[idx].name; } catch (_) { return "(unknown document)"; }
    }
})();