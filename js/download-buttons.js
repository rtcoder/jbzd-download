function addDownloadBtnToImages(parentArticle) {
    const imageContainers = getImageContainers(parentArticle);

    imageContainers.forEach(c => {
        const url = getImageUrl(c);
        const downloadParams = [{url}];
        const downloadBtn = createDownloadBtn(downloadParams, '', 'on-image');
        c.appendChild(downloadBtn);
    });
}

function modifyVideoDownloadBtnAction(parentArticle) {
    const buttons = getVideoDownloadButtons(parentArticle);
    buttons.forEach(btn => {
        const url = btn.href;
        const downloadParams = [{url}];
        btn.querySelector('span')?.remove();
        const html = btn.innerHTML;
        const newBtn = document.createElement('button');
        newBtn.innerHTML = html;
        newBtn.classList = btn.classList;
        setClickAction(newBtn, downloadParams);
        const parent = btn.parentNode;
        parent.replaceChild(newBtn, btn);
    });
}

function addDownloadBtnToPosts() {
    const postContainers = document.querySelectorAll('article.article');

    postContainers.forEach(article => {
        const videoDownloadUrls = Array.from(getVideoDownloadButtons(article)).map(btnAnchor => btnAnchor.href);
        const imageDownloadUrls = Array.from(getImageContainers(article)).map(container => {
            return container.querySelector('img')?.src;
        });
        addDownloadBtnToImages(article);
        modifyVideoDownloadBtnAction(article);

        const titleDiv = article.querySelector('.article-title');
        titleDiv.style.paddingRight = '30px';

        const title = titleDiv.querySelector('a').textContent.trim()
            .replace(/[^0-9a-zA-Z_]/g, '');
        const downloadParams = [...videoDownloadUrls, ...imageDownloadUrls]
            .filter(url => !!url)
            .filter((item, idx, array) => array.indexOf(item) === idx)
            .map(url => {
                return {
                    url,
                    filename: title + '/' + getFilename(url),
                };
            });
        console.log({downloadParams});
        const downloadBtn = createDownloadBtn(downloadParams, 'Pobierz wszystko z posta');
        titleDiv.appendChild(downloadBtn);
    });
}

function getImageContainers(parentArticle) {
    const imageContainers = [];
    const containers = parentArticle.querySelectorAll('div.article-image');
    containers.forEach(c => {
        if (c.querySelector('.video-player')) {
            return;
        }
        imageContainers.push(c);
    });

    return imageContainers;
}

function getVideoDownloadButtons(parentArticle) {
    return parentArticle.querySelectorAll('.plyr__controls__item.plyr__control');
}

function getImageUrl(container) {
    const img = container.querySelector('img');
    return img.src;
}

function getFilename(url) {
    console.log({url});
    return url.split('?')[0].split('/').at(-1);
}

function createDownloadBtn(downloadParams, tooltipText = '', additionalClass = null) {
    const downloadBtn = document.createElement('button');
    const icon = getDownloadSvgIcon();
    const tooltip = tooltipText ? `<span class="btn-tooltip">${tooltipText}</span>` : '';
    downloadBtn.innerHTML = `${icon}${tooltip}`;

    downloadBtn.classList.add('jbzd-dwl-btn');
    if (additionalClass) {
        downloadBtn.classList.add(additionalClass);
    }
    setClickAction(downloadBtn, downloadParams);

    return downloadBtn;
}

function setClickAction(downloadBtn, downloadParams) {
    downloadBtn.addEventListener('click', e => {
        e.preventDefault();
        const param = {downloadParams, msgName: 'download'};
        chrome.runtime.sendMessage(param);
    });
}

function getDownloadSvgIcon() {
    return `<svg id="plyr-download" viewBox="0 0 18 18"><path d="M9 13c.3 0 .5-.1.7-.3L15.4 7 14 5.6l-4 4V1H8v8.6l-4-4L2.6 7l5.7 5.7c.2.2.4.3.7.3zm-7 2h14v2H2z"></path></svg>`;
}
