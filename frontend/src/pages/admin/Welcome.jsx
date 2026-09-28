import { useState, useEffect } from "react";
import grapesjs from "grapesjs";
import GjsEditor from "@grapesjs/react";
import basicBlocks from "grapesjs-blocks-basic";

import "grapesjs/dist/css/grapes.min.css";

import "./Welcome.css";
import api from "../../api/axios";
import { API_URL } from "../../config";

function Welcome() {
    const [editor, setEditor] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleEditor = (editorInstance) => {

        console.log("GrapesJS loaded");

        setEditor(editorInstance);        
    };

    useEffect(() => {
        if (!editor) {
            return;
        }
        editor.BlockManager.add("div", {
            label: "Div",
            category: "Basic",
            content: {
                type: "default",
                tagName: "div",
                style: {
                    "min-height": "100px",
                    padding: "20px",
                },
            },
        });
        const loadWelcomePage = async () => {
            try {
                const response = await api.get("/admin/welcome");

                const page = response.data;

                if (page.project_data) {
                    editor.loadProjectData(page.project_data);
                }
                // Apply latest CSS saved in database
                if (page.css) {
                    editor.setStyle(page.css);
                }

                // Apply latest HTML if required
                if (page.html) {
                    editor.setComponents(page.html);
                }
            } catch (error) {
                console.error("Failed to load welcome page:", error);
            }
        };

        loadWelcomePage();

    }, [editor]);

    const handleSave = async () => {
        if (!editor) {
            return;
        }

        const html = editor.getHtml();
        const css = editor.getCss();

        // Get complete GrapesJS project data
        const projectData = editor.getProjectData();

        //console.log("HTML:", html);
        //console.log("CSS:", css);
        //console.log("Project Data:", projectData);

        setSaving(true);

        try {
            const response = await api.put(
                "/admin/welcome",
                {
                    html,
                    css,
                    project_data: projectData
                }
            );

            console.log("Save response:", response.data);

            alert("Welcome page saved successfully!");

        } catch (error) {
            console.error("Save failed:", error);

            if (error.response) {
                console.error("API error:", error.response.data);
            }
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="welcome-editor-page">

            <div className="editor-header">
                <h1>Welcome Page</h1>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={!editor || saving}
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>

            <div className="grapes-editor">
                <GjsEditor
                    grapesjs={grapesjs}
                    grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
                    onEditor={handleEditor}
                    options={{
                        height: "calc(100vh - 80px)",

                        storageManager: false,

                        plugins: [
                            basicBlocks,
                        ],

                       assetManager: {
                            upload: `${API_URL}/admin/media/upload`,

                            uploadName: "files",

                            autoAdd: true,

                            headers: {
                                Authorization:
                                    `Bearer ${localStorage.getItem("access_token")}`,
                            },
                        },

                        blockManager: {
                            blocks: [
                                "column1",
                                "column2",
                                "column3",
                                "text",
                                "link",
                                "image",
                                "video",
                                "map",
                            ],
                        },

                        canvas: {
                            styles: [
                                `
                                * {
                                        box-sizing: border-box;
                                    }

                                    html,
                                    body {
                                        width: 100%;
                                        height: 100%;
                                        margin: 0;
                                        padding: 0;
                                        overflow: hidden;
                                    }

                                    body {
                                        width: 100vw;
                                        height: 100vh;
                                    }

                                    /* Main full-screen container */
                                    #ik7w8 {
                                        width: 100%;
                                        height: 100vh;
                                        min-height: 100vh;

                                        display: flex;
                                        flex-direction: column;

                                        justify-content: center; /* vertical center */
                                        align-items: center;     /* horizontal center */

                                        padding: 20px;
                                        overflow: hidden;
                                    }

                                    /* Heading section */
                                    #iqj5h {
                                        width: 100%;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;

                                        padding: 10px;
                                    }

                                    /* Heading inner container */
                                    #ij9zc {
                                        width: 100%;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                    }

                                    /* Heading */
                                    #i509b-2 {
                                        margin: 0;
                                        text-align: center;
                                        font-family: Arial, sans-serif;

                                        font-size: clamp(28px, 4vw, 60px);
                                        line-height: 1.2;
                                    }

                                    /* Image section */
                                    #idv1f {
                                        width: 100%;

                                        display: flex;
                                        justify-content: center;
                                        align-items: center;

                                        flex-wrap: wrap;
                                        gap: clamp(15px, 2vw, 40px);

                                        padding: 20px;
                                    }

                                    /* Images */
                                    #ifxc5,
                                    #it9nw {
                                        width: clamp(180px, 25vw, 400px);
                                        height: auto;
                                        max-height: 45vh;

                                        object-fit: contain;
                                        margin: 0;
                                    }
                                `,
                            ],
                        },

                        components: `
                            <div class="welcome-container">

                                <h1 class="welcome-title">
                                    Welcome to Munshi Premchand School - 265
                                </h1>

                                <div class="welcome-images">

                                    <img
                                        src="https://via.placeholder.com/250x180"
                                        alt="School Photo"
                                    />

                                    <img
                                        src="https://via.placeholder.com/250x180"
                                        alt="School Logo"
                                    />

                                </div>

                            </div>
                        `,
                    }}
                />
            </div>

        </div>
    );
}

export default Welcome;