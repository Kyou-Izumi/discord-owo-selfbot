# safe-base64

base64url - URL-safe base64 for node.js Buffer

Fork of [urlsafe-base64](https://github.com/RGBboy/urlsafe-base64)

## Usage

```typescript
import { encode, decode } from "safe-base64"
```

### encode(buffer)

Encodes a buffer to a URL-safe base64 string (RFC 4648). The padding is removed.

### decode(input)

Decodes a string to a buffer.

## Why

* No out-of-scope methods
* No confusing extra input parameters
* Written in TypeScript
