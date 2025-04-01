/**
 * Tab management module
 */

import { syncForwardToInverseInputs, syncInverseToForwardInputs } from './sync.js';

/**
 * Initialize tabs
 */
export function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');

            // Reset all result box colors when switching tabs
            const resultBoxes = document.querySelectorAll('.result-box');
            resultBoxes.forEach(box => {
                box.style.backgroundColor = '';
                box.style.color = '';
            });

            // Sync values and update button styles when switching tabs
            if (tabId === 'inverse') {
                syncForwardToInverseInputs();
            } else if (tabId === 'forward') {
                syncInverseToForwardInputs();
            }
        });
    });
} 