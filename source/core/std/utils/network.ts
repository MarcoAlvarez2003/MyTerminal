import { DOMParser, Element } from "../../../imports/dom.ts";

class Page {
  public static async request(url: string) {
    const parser = new DOMParser();

    const document = parser.parseFromString(await (await fetch(url)).text(), "text/html");

    const title = document?.querySelector("title")?.textContent as string;

    console.log(`Page: ${title}`);
    console.log();

    if (document?.body) {
      this.checkEachChild(document.body);
    }

    console.log();
  }

  protected static checkEachChild(node: Element) {
    const childrens = Array.from(node.children);

    if (childrens.length) {
      for (const node of childrens) {
        if (this.isValidCHild(node)) {
          this.checkEachChild(node);
        } else {
          this.showTextContent(node);
        }
      }
    } else {
      this.showTextContent(node);
    }
  }

  protected static isValidCHild({ tagName }: Element) {
    switch (tagName.toLowerCase()) {
      case "header":
      case "main":
      case "div":
      case "ul":
      case "ol":
      case "li":
      case "p":
        return true;
    }

    return false;
  }

  protected static showTextContent(node: Element) {
    if (this.isValidCHild(node)) {
      console.log(node.textContent);
      console.log();
    }
  }
}

export { Page };
