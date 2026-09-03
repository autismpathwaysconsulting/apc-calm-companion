#import <AppKit/AppKit.h>

static void renderSymbol(NSString *name, NSString *filename, NSString *outputDirectory) {
    NSImage *source = [NSImage imageWithSystemSymbolName:name accessibilityDescription:nil];
    if (source == nil) {
        [NSException raise:@"MissingSymbol" format:@"Unable to load SF Symbol: %@", name];
    }

    NSImageSymbolConfiguration *size = [NSImageSymbolConfiguration configurationWithPointSize:66 weight:NSFontWeightRegular];
    NSImageSymbolConfiguration *color = [NSImageSymbolConfiguration configurationWithPaletteColors:@[[NSColor systemBlueColor]]];
    NSImage *image = [source imageWithSymbolConfiguration:[size configurationByApplyingConfiguration:color]];

    NSBitmapImageRep *bitmap = [[NSBitmapImageRep alloc]
        initWithBitmapDataPlanes:nil
        pixelsWide:128
        pixelsHigh:128
        bitsPerSample:8
        samplesPerPixel:4
        hasAlpha:YES
        isPlanar:NO
        colorSpaceName:NSDeviceRGBColorSpace
        bytesPerRow:0
        bitsPerPixel:0];
    bitmap.size = NSMakeSize(128, 128);

    [NSGraphicsContext saveGraphicsState];
    [NSGraphicsContext setCurrentContext:[NSGraphicsContext graphicsContextWithBitmapImageRep:bitmap]];
    [[NSColor clearColor] setFill];
    NSRectFill(NSMakeRect(0, 0, 128, 128));

    NSSize imageSize = image.size;
    CGFloat scale = MIN(88 / imageSize.width, 88 / imageSize.height);
    NSSize drawSize = NSMakeSize(imageSize.width * scale, imageSize.height * scale);
    NSRect drawRect = NSMakeRect((128 - drawSize.width) / 2, (128 - drawSize.height) / 2, drawSize.width, drawSize.height);
    [image drawInRect:drawRect];
    [NSGraphicsContext restoreGraphicsState];

    NSData *png = [bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
    NSString *path = [outputDirectory stringByAppendingPathComponent:filename];
    if (![png writeToFile:path atomically:YES]) {
        [NSException raise:@"WriteFailure" format:@"Unable to write %@", path];
    }
}

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        if (argc != 2) {
            fprintf(stderr, "Usage: render-install-symbols OUTPUT_DIRECTORY\n");
            return 2;
        }
        NSString *outputDirectory = [NSString stringWithUTF8String:argv[1]];
        renderSymbol(@"square.and.arrow.up", @"install-apple-share.png", outputDirectory);
        renderSymbol(@"plus.square.on.square", @"install-apple-home.png", outputDirectory);
    }
    return 0;
}
