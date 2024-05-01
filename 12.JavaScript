function search() {
    let input = document.querySelector('#search input').value.toLowerCase();
    let articles = document.getElementsByTagName('article');

    for (let article of articles) {
        let title = article.querySelector('h2').textContent.toLowerCase();
        let content = article.querySelector('p').textContent.toLowerCase();

        if (title.includes(input) || content.includes(input)) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    }
}

document.querySelector('#search button').addEventListener('click', search);
function generateTagCloud() {
    let tags = {}; // 存储标签和它们的频率
    let articles = document.getElementsByTagName('article');

    for (let article of articles) {
        let articleTags = article.getAttribute('data-tags').split(',');
        for (let tag of articleTags) {
            if (tags[tag]) {
                tags[tag]++;
            } else {
                tags[tag] = 1;
            }
        }
    }

    let tagCloudContent = '';
    for (let tag in tags) {
        tagCloudContent += `<a href="#" style="font-size: ${10 + tags[tag] * 5}px;">${tag}</a> `;
    }

    document.querySelector('#tag-cloud').innerHTML += tagCloudContent;
}

generateTagCloud();
