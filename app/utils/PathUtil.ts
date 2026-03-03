export class PathUtil {
    static DefaultPath = ["blog"]

    static getPath(section: string | string[]) {
        return this.DefaultPath.concat(section);
    }

    static getAbsolutePathString(sections: string[]) {
        return '/' + sections.join('/');
    }
}