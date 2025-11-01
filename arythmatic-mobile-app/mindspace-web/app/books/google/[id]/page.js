"use client";
import React from 'react';

export default function GoogleBookReader({ params }){
  const { id } = params;
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    let script = document.querySelector('#gbooks-js');
    function init(){
      // eslint-disable-next-line no-undef
      google.books.load();
      // eslint-disable-next-line no-undef
      google.books.setOnLoadCallback(function() {
        // eslint-disable-next-line no-undef
        const viewer = new google.books.DefaultViewer(containerRef.current);
        viewer.load(`https://books.google.com/books?id=${id}`);
      });
    }
    if (!script){
      script = document.createElement('script');
      script.id = 'gbooks-js';
      script.src = 'https://www.google.com/books/jsapi.js';
      script.onload = init;
      document.body.appendChild(script);
    } else {
      init();
    }
  }, [id]);

  return (
    <div className="p-4 pb-20 max-w-3xl mx-auto">
      <div className="text-xl font-semibold mb-2">Google Book Viewer</div>
      <div ref={containerRef} className="card p-2" style={{ minHeight: 480 }} />
    </div>
  );
}
