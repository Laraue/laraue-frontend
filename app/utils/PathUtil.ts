export class PathUtil {
    static DefaultPath = ["blog"]

    static getPath(section: string | string[]) {
        return this.DefaultPath.concat(section);
    }

    static getPathString(sections: string[]) {
        return sections.join('/');
    }

    static getAbsolutePathString(sections: string[]) {
        return '/' + sections.join('/');
    }
}