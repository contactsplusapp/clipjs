export default class XPathSelector {
    static select(xpath, element = document) {
        const res = document.evaluate(xpath, element);
        const results = [];
        let result = res.iterateNext();
        while(result) {
            results.push(result);
            result = res.iterateNext();
        }

        return results.length ? results : null;
    }
}