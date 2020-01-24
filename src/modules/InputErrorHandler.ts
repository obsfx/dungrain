const InputErrorHandler = (args: {
    seed: string | undefined,
    iterationCount: number,
    column: number,
    row: number,
    minimumWHRatio: number | undefined,
    maximumWHRatio: number | undefined,
    minimumChunkWidth: number | undefined,
    minimumChunkHeight: number | undefined,
    indexMap: {
        Wall: number,
        Path: number,
        Room: number,
        Empty: number
    }
}): string[] => {
    let errors: string[] = [];
    if (typeof args == 'undefined') {
        errors.push('please pass necessary arguments. [ iterationCount, column, row, indexMap ]');
    } else {
        /* type checks */
        if (typeof args.seed != 'string' && typeof args.seed != 'undefined') {
            errors.push('seed value must be a string.');
        }

        if (typeof args.iterationCount != 'number') {
            errors.push('iterationCount value must be a number.');
        }

        if (typeof args.column != 'number') {
            errors.push('column value must be a number.');
        }

        if (typeof args.row != 'number') {
            errors.push('row value must be a number.');
        }

        if (typeof args.minimumWHRatio != 'number' && typeof args.minimumWHRatio != 'undefined') {
            errors.push('minimumWHRatio value must be a number.');
        }

        if (typeof args.maximumWHRatio != 'number' && typeof args.maximumWHRatio != 'undefined') {
            errors.push('maximumWHRatio value must be a number.');
        }

        if (typeof args.minimumChunkWidth != 'number' && typeof args.minimumChunkWidth != 'undefined') {
            errors.push('minimumChunkWidth value must be a number.');
        }

        if (typeof args.minimumChunkHeight != 'number' && typeof args.minimumChunkHeight != 'undefined') {
            errors.push('minimumChunkHeight value must be a number.');
        }

        if (typeof args.indexMap != 'undefined') {
            if (typeof args.indexMap.Wall != 'number') {
                errors.push('indexMap.Wall value must be a number.');
            }
        
            if (typeof args.indexMap.Path != 'number') {
                errors.push('indexMap.Path value must be a number.');
            }
        
            if (typeof args.indexMap.Room != 'number') {
                errors.push('indexMap.Room value must be a number.');
            }
        
            if (typeof args.indexMap.Empty != 'number') {
                errors.push('indexMap.Empty value must be a number.');
            }
        } else {
            errors.push('indexMap object couldn\'t found. you must define "Wall, Path, Room, Empty" indices in indexMap object.');
        }
        
        /* zero checks */
        if (args.iterationCount < 0) {
            errors.push('iterationCount can\'t be less than zero.');
        }

        if (args.column < 0) {
            errors.push('column can\'t be less than zero.');
        }

        if (args.row < 0) {
            errors.push('row can\'t be less than zero.');
        }

        if (typeof args.minimumWHRatio == 'number') {
            if (args.minimumWHRatio < 0) {
                errors.push('minimumWHRatiocan\'t be less than zero.');
            }
        }

        if (typeof args.maximumWHRatio == 'number') {
            if (args.maximumWHRatio < 0) {
                errors.push('maximumWHRatio can\'t be less than zero.');
            }
        }

        if (typeof args.minimumChunkWidth == 'number') {
            if (args.minimumChunkWidth < 0) {
                errors.push('minimumChunkWidth can\'t be less than zero.');
            }
        }

        if (typeof args.minimumChunkHeight == 'number') {
            if (args.minimumChunkHeight < 0) {
                errors.push('minimumChunkHeight can\'t be less than zero.');
            }
        }

        /* ratio check */
        if (args.minimumWHRatio && args.maximumWHRatio) {
            if (args.minimumWHRatio > args.maximumWHRatio) {
                errors.push('minimumWHRatio can\'t be greater than maximumWHRatio.');
            }
        }
    }
    
    return errors;
}

export default InputErrorHandler;