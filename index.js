/**
 * This is a helper function file which enables the functionality of Read more and Read less
 * text.
 *
 * How to use?
 * - Add a custom class to the parent element which has the text.
 * - Add a custom class to the 'Read More' toggle button.
 * - Use the function like this:
 *      ``` readMoreText('.read-more-text', 100, '.readmore-btn'); ```
 *
 * It will add an click event listener to the button and on click, takes the element with
 * `read-more-text` class in it and safely splits the html to enable this 'Read more' functionality.
 * and vice verda for 'Read less'
*/

const findUnclosedTags = (raw_html) => {
    /**
     * This function finds the unclosed html element tags from raw html markup string.
    */
    const unclosed_tags = [];
    const stack = [];
    const tag_regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
    let match;

    // Extracting all tags from the HTML string.
    const tags = [];
    while ((match = tag_regex.exec(raw_html)) !== null) {
        tags.push({ tag: match[1], is_closing: raw_html[match.index + 1] === '/' });
    }

    // Iterating through tags from right to left.
    for (let i = tags.length - 1; i >= 0; i--) {
        const { tag, is_closing } = tags[i];
        if (!is_closing) {
            // If it's an opening tag
            if (stack.length > 0 && stack[stack.length - 1] === tag) {
                stack.pop(); // Matching closing tag found, pop from stack
            } else {
                unclosed_tags.push(`</${tag}>`); // Add to unclosed tags
            }
        } else {
            // If it's a closing tag, push to stack.
            stack.push(tag);
        }
    }

    return unclosed_tags; // Reverse to get in natural order
}

const readMoreText = (element_class, split_point_index=100, toggle_button_class) => {
    /**
     * This function gets the html element with the mentionied class from the DOM
     * and converts it to raw html text.
     * Then based on the `split_point_index`, which is the number of characters after which the
     * string should be splitted, it splits the raw html into 2 parts.
     * There is an additional feature that it looks for the last whitespace before the `split_point_index`
     * and it safe splits the raw text. It is done so that there is no half-written html tag comes
     * when the raw html is splitted.
     *
     * Then based on the findUnclosedTags() function, it appends the unclosed tags at the end.
     * This enables the feature of doing "read more" and "read less" text for any dynamic content
     * added to the block via WYSIWYG ACF field.
     *
     * All this happens on a button click. This function also asks for button class and adds an on click
     * event listener to it. It adds class to the button based on the visible text state.
    */

    const full_text_element = document.querySelector( element_class ?? '' );
    const toggle_button_element = document.querySelector( toggle_button_class ?? '' );
    if (!full_text_element || !toggle_button_element) return;

    // Getting raw HTML as a string.
    const raw_html = full_text_element.innerHTML;

    const partialShowingText = () => {
        // Safely splitting the raw HTML text wrt to the `split_point_index`.
        const last_whitespace_index = raw_html.lastIndexOf(' ', split_point_index);
        let raw_html_default_visible = raw_html.slice(0, last_whitespace_index)

        // Finding unclosed html tags as a list.
        const unclosed_tags_list = findUnclosedTags(raw_html_default_visible);

        // Closing the tags based on unclosed tags list.
        raw_html_default_visible += unclosed_tags_list.join('');

        // Adding the updated raw html to the DOM.
        full_text_element.innerHTML = raw_html_default_visible;
    }

    partialShowingText();

    toggle_button_element.classList.add('text-state-partial');

    toggle_button_element.addEventListener('click', () => {

        const class_list = toggle_button_element.classList;
        const current_text_show_state = [...class_list].filter(el => el.includes('text-state-'))[0] ?? '';

        if ('text-state-full' === current_text_show_state) {
            // If full text is currently visible.
            partialShowingText();

            // Replacing the text show state class.
            toggle_button_element.classList.add('text-state-partial');
            toggle_button_element.classList.remove('text-state-full');

        } else if ('text-state-partial' === current_text_show_state) {
            // If partial text is currently visible.

            full_text_element.innerHTML = raw_html;

            // Replacing the text show state class.
            toggle_button_element.classList.add('text-state-full');
            toggle_button_element.classList.remove('text-state-partial');
        }
    })
}

// ----------- main ----------
  document.addEventListener("DOMContentLoaded", function(event) {
    readMoreText('.read-more-text', 100, '.readmore-btn');
});
