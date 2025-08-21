import { ChatParser } from "./src/chat-parser";

// 簡単なテスト実行
const parser = new ChatParser();

const testMarkdown = `
\`\`\`chat
> Alice: Hello, how are you?
>> Bob: I'm good, thanks! How about you?
>>> Alice: Great! I was wondering if you could help me with something.
\`\`\`
`;

console.log("Test starting...");

try {
  const result = parser.parseMarkdown(testMarkdown);
  console.log("Parsed result:", JSON.stringify(result, null, 2));
  console.log("Comments count:", result.comments.length);
  console.log("Speakers count:", result.speakers.length);
} catch (error) {
  console.error("Parse error:", error);
}

console.log("Test completed.");
