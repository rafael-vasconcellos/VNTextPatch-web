export default function Contribute() {
    return (
        <div class="card w-3/5 flex justify-around items-center" role="region" aria-label="Contribua com o repositório no GitHub">
            <div class="w-1/2 text-handsontable-foreground">
                <h2 class="font-bold text-2xl text-white">Help improve this project ✨</h2>
                <p class="lead py-3.5 text-sm">
                    Contributing code, documentation, or ideas is the fastest way to grow this project. 
                    Your time and suggestions are important—submit a pull request, report issues, or suggest improvements.
                </p>

                <ul class="text-xs">
                    <li>Please read the repository's <strong>CONTRIBUTING.md</strong> before submitting PRs.</li>
                    <li>Not sure where to start? Leave a comment on an issue—maintainers will guide you.</li>
                </ul>

                <p class="text-sm">Tip: Click the link to open the repository.</p>
            </div>

            <a class="cta h-fit w-72" id="contributeBtn" href="#" target="_blank" rel="noopener noreferrer"
            role="button" aria-label="Contribuir no GitHub — abre em nova aba">
                {/* <!-- GitHub Mark (SVG) --> */}
                <svg viewBox="0 0 16 16" aria-hidden="true">
                    <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                    0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                    -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64
                    -.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68
                    0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87
                    3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42
                    -3.58-8-8-8z"/>
                </svg>

                <span class="inline-block text-left">
                    <div class="text-[15px]">Contribute on GitHub</div>
                    <div class="text-[12px] opacity-90">Open issues, Pull Requests, or leave a ⭐</div>
                </span>
            </a>
        </div>
    )
}