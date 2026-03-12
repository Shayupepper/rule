// 2024-04-03 15:00

const privacyGate_style = `
<head>
<style id="privacy-gate">
    html.locked body { 
        visibility: hidden !important; 
        background: #000 !important;  
    }
</style>
`;

const privacyGate_script = `
<script>
(function() {
    const isOn = localStorage.getItem('nsfw_status') === 'on';
    const isLocked = localStorage.getItem('is_locked') === 'true';
    const hasPwd = !!localStorage.getItem('privateProtect');

    if (isOn && (isLocked || !hasPwd)) {
        document.documentElement.classList.add('locked');
    } else {
        var gate = document.getElementById('privacy-gate');
        if (gate) gate.remove();
    }
})();
</script>
</body>
`;

const TITLE_INJECTION_BASE = `<head>\n`;
const BODY_INJECTION_BASE = `</body>`;

// 正则匹配
const TARGET_SITES_REGEX = /(missav|netflav|hitomi|supjav|njav|javday|91porna|javggvideo|turbovidhls|turboplayers|turtleviplay|findjav|emturbovid)/i;
const JAVBUS_REGEX = /(javbus)/i;
const DMM_REGEX = /dmm\.co/i;
const MDSP_REGEX = /cloudfront\.net/i;
const HUARENLIVE_REGEX = /(huaren|huavod)\.(live|top)\/player\/ec\.php/i;

const TITLE_REGEX = /<head>/i;
const BODY_REGEX = /<\/body>/i;
const WINDOW_OPEN_REGEX = /window\.open\s*\(/g;

function main() {
    try {
        const url = $request.url;
        const headers = $response.headers;
        let body = $response.body;

        const contentType = headers['Content-Type'] || headers['content-type'] || '';
        if (!contentType.includes('text/html')) {
            return $done({});
        }

        if (typeof body !== 'string') {
            body = body.toString('utf8');
        }

        let modified = false;
        let newBody = body;

        const isTargetSite = TARGET_SITES_REGEX.test(url);
        const isJavbus = JAVBUS_REGEX.test(url);
        const isDMM = DMM_REGEX.test(url);
        const isMDSP = MDSP_REGEX.test(url);
        const isHuarenlive = HUARENLIVE_REGEX.test(url);

        if (isTargetSite) {
            if (TITLE_REGEX.test(newBody)) {
                newBody = newBody.replace(TITLE_REGEX, TITLE_INJECTION_BASE);
                modified = true;
            }
            newBody = newBody.replace(WINDOW_OPEN_REGEX, 'function block_open(');
            modified = true;

        } else if (isJavbus || isDMM || isMDSP) {
            if (BODY_REGEX.test(newBody)) {
                newBody = newBody.replace(TITLE_REGEX, privacyGate_style);
                newBody = newBody.replace(BODY_REGEX, privacyGate_script);
                modified = true;
            }

        } else if (isHuarenlive) {
            newBody = newBody
                .replace(/"time":\s*"20"/g, '"time":"0"')
                .replace(/"img":\s*"[^"]*"/g, '"img":""');
            modified = true;

        } else {
            if (TITLE_REGEX.test(newBody)) {
                newBody = newBody.replace(TITLE_REGEX, privacyGate_style);
                newBody = newBody.replace(BODY_REGEX, privacyGate_script);
                newBody = newBody.replace(TITLE_REGEX, TITLE_INJECTION_BASE);
                modified = true;
            }
        }

        if (!modified) {
            return $done({});
        }

        // 清理安全头
        const newHeaders = { ...headers };
        newHeaders["Cross-Origin-Embedder-Policy"] = "unsafe-none";
        newHeaders["Cross-Origin-Opener-Policy"] = "unsafe-none";
        newHeaders["Cross-Origin-Resource-Policy"] = "cross-origin";

        delete newHeaders["Content-Security-Policy"];
        delete newHeaders["content-security-policy"];
        delete newHeaders["X-Frame-Options"];
        delete newHeaders["x-frame-options"];
        delete newHeaders["Referrer-Policy"];

        $done({
            headers: newHeaders,
            body: newBody
        });

    } catch (e) {
        console.log("Rewrite Error:", e.message);
        $done({});
    }
}

// 执行
main();
