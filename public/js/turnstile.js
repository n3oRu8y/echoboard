function ShowTurnstileSpinner() {
    const modalElement = document.getElementById("turnstileSpinner");

    const modal = new bootstrap.Modal(modalElement, {
        backdrop: "static",
        keyboard: false
    });

    modal.show();
}


function HideTurnstileSpinner() {
    const modalElement = document.getElementById("turnstileSpinner");

    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
        modal.hide();
    }
}

let turnstileWidgetId = null;

function InitTurnstile() {
    try {
        turnstileWidgetId = turnstile.render("#turnstileContainer", {
            sitekey: sitekey,
            execution: "execute",

            callback: function(token) {
                HideTurnstileSpinner();

                if (window.turnstileResolve) {
                    window.turnstileResolve(token);
                    window.turnstileResolve = null;
                }
            },

            "error-callback": function() {
                HideTurnstileSpinner();

                if (window.turnstileResolve) {
                    window.turnstileResolve("");
                    window.turnstileResolve = null;
                }
            },

            "expired-callback": function() {
                HideTurnstileSpinner();

                if (window.turnstileResolve) {
                    window.turnstileResolve("");
                    window.turnstileResolve = null;
                }
            }
        });
    } catch (e) {
        HideTurnstileSpinner();
        console.error(e);

        if (window.turnstileResolve) {
            window.turnstileResolve("");
            window.turnstileResolve = null;
        }
    } finally {
        HideTurnstileSpinner();
    }
}

function RenderTurnstile() {
    return new Promise((resolve, reject) => {
        ShowTurnstileSpinner();

        window.turnstileResolve = resolve;

        if (turnstileWidgetId === null) {
            InitTurnstile();
        }

        turnstile.reset(turnstileWidgetId);
        turnstile.execute(turnstileWidgetId);
    });
}