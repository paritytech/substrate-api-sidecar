// Guide content for Substrate API Sidecar Documentation
// This file imports markdown files and converts them to HTML

import assetHubMigrationMd from '../guides/ASSET_HUB_MIGRATION.md';

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
    // Store code blocks temporarily to prevent them from being processed
    const codeBlocks = [];
    let codeBlockIndex = 0;
    
    // Step 1: Extract and preserve code blocks
    let html = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
        const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
        codeBlocks[codeBlockIndex] = `<div class="code-block"><div class="code-header"><span>${language || 'Code'}</span><button class="copy-button" data-copy="${escapeHtml(code.trim())}"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/></svg></button></div><pre><code>${escapeHtml(code.trim())}</code></pre></div>`;
        codeBlockIndex++;
        return placeholder;
    });
    
    // Step 2: Process special warning callouts first
    html = html.replace(/## ⚠️ Important: (.*$)/gm, '<div class="notice-box warning"><div class="notice-content"><strong>⚠️ Important:</strong> $1</div></div>');
    
    // Step 3: Process blockquotes and special notices
    html = html.replace(/^> \*\*Note\*\*: (.*$)/gm, '<div class="notice-box info"><div class="notice-content"><strong>Note:</strong> $1</div></div>');
    html = html.replace(/^> \*\*Important\*\*: (.*$)/gm, '<div class="notice-box warning"><div class="notice-content"><strong>Important:</strong> $1</div></div>');
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Step 4: Process headers (now safe from code block interference)
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
    
    // Step 5: Process inline formatting
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Step 6: Process links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Step 7: Process lists
    html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
    
    // Step 8: Split into blocks and process paragraphs
    const blocks = html.split(/\n\s*\n/);
    const processedBlocks = [];
    
    for (let block of blocks) {
        block = block.trim();
        if (!block) continue;
        
        // Skip already processed HTML blocks
        if (block.startsWith('<h') || block.startsWith('<div') || block.startsWith('<blockquote') || block.includes('__CODE_BLOCK_')) {
            processedBlocks.push(block);
            continue;
        }
        
        // Handle list blocks
        if (block.includes('<li>')) {
            // Check if it's an ordered or unordered list
            const hasNumberedItems = /^\d+\./.test(block.split('\n')[0]);
            const listTag = hasNumberedItems ? 'ol' : 'ul';
            processedBlocks.push(`<${listTag}>${block}</${listTag}>`);
            continue;
        }
        
        // Regular paragraph
        processedBlocks.push(`<p>${block.replace(/\n/g, ' ')}</p>`);
    }
    
    // Step 9: Join blocks with proper spacing
    html = processedBlocks.join('\n\n');
    
    // Step 10: Clean up list formatting
    html = html.replace(/<\/(ul|ol)>\s*<\1>/g, '');
    
    // Step 11: Restore code blocks
    for (let i = 0; i < codeBlocks.length; i++) {
        html = html.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i]);
    }
    
    return html;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Export guide content with HTML conversion
export const GUIDES_CONTENT = {
    'asset-hub-migration': convertMarkdownToHtml(assetHubMigrationMd)
};

export const GUIDE_METADATA = {
    'asset-hub-migration': {
        title: 'Asset Hub Migration & Elastic Scaling Guide',
        description: 'Migration guide for Asset Hub endpoints and elastic scaling functionality'
    }
};