export default [
    {
        "date": "2025-03-03",
        "codeInventaire": "popde",
        "observer": "diego",
        "MediaSection": [
            {
                "date": "2025-03-03",
                "codeInventaire": "popde",
                "observer": "diego",
                "mollusk_scientific_name": "Cornu aspersum",
                "$created_on": "invertebres_workflow",
                "type_border": "Hedge",
                "$label": "mollusk",
                "email": "diego.roulle@u-pec.fr",
                "domainId": "CDG"
            },
            {
                "date": "2025-03-03",
                "codeInventaire": "popde",
                "observer": "diego",
                "$created_on": "invertebres_workflow",
                "ground_beetle_scientific_name": "Nebria brevicollis",
                "type_border": "Hedge",
                "$label": "ground_beetle",
                "email": "diego.roulle@u-pec.fr",
                "domainId": "CDG"
            }
        ],
        "$created_on": "invertebres_workflow",
        "type_border": "Hedge",
        "$created_on_content": {
            "actors": [
                "chibani@u-pec.fr"
            ],
            "workflow_id": "invertebres_workflow",
            "last_updated": {
                "seconds": 1733038769,
                "nanos": 0
            },
            "workflow_label": "Invertebres workflows",
            "children": [
                {
                    "form_label": "intertebre protocol",
                    "children": {
                        "formData": {
                            "form_version": "1.0.2",
                            "form_label": "Second page of the mollusk protocol",
                            "last_updated": {
                                "seconds": 1735335600,
                                "nanos": 0
                            },
                            "form": [
                                {
                                    "field_key": "type_border",
                                    "select_options": [
                                        {
                                            "label": "Edge"
                                        },
                                        {
                                            "label": "Hedge"
                                        },
                                        {
                                            "label": "Grassy strip"
                                        },
                                        {
                                            "label": "Roadside or path edge"
                                        },
                                        {
                                            "label": "Ditch"
                                        },
                                        {
                                            "label": "None"
                                        }
                                    ],
                                    "field_label": "type of the first border",
                                    "field_type": "select"
                                },
                                {
                                    "field_required": true,
                                    "field_key": "ObsPicture",
                                    "field_label": "Add the picture of the observation",
                                    "field_type": "picturepicker"
                                },
                                {
                                    "field_required": false,
                                    "field_max": 1,
                                    "field_key": "MediaSection",
                                    "field_label": "sections label",
                                    "field_children": [
                                        {
                                            "field_required": false,
                                            "field_max": 0,
                                            "field_min": 0,
                                            "field_label": "mollusk",
                                            "field_children": [
                                                {
                                                    "field_required": false,
                                                    "field_key": "ObsPicture_1",
                                                    "field_label": "Add the picture of mollusk",
                                                    "field_type": "picturepicker"
                                                },
                                                {
                                                    "field_species_type": "mollusk",
                                                    "field_type": "recognition"
                                                },
                                                {
                                                    "field_key": "mollusk_scientific_name",
                                                    "select_options": [
                                                        {
                                                            "label": "Helix pomatia"
                                                        },
                                                        {
                                                            "label": "Cepaea nemoralis"
                                                        },
                                                        {
                                                            "label": "Arion vulgaris"
                                                        },
                                                        {
                                                            "label": "Cornu aspersum"
                                                        },
                                                        {
                                                            "label": "Lymnaea stagnalis"
                                                        },
                                                        {
                                                            "label": "Planorbarius corneus"
                                                        },
                                                        {
                                                            "label": "Viviparus viviparus"
                                                        },
                                                        {
                                                            "label": "Dreissena polymorpha"
                                                        },
                                                        {
                                                            "label": "Anodonta anatina"
                                                        },
                                                        {
                                                            "label": "Unio pictorum"
                                                        }
                                                    ],
                                                    "field_label": "Mollusk Scientific Name",
                                                    "field_type": "select"
                                                }
                                            ],
                                            "field_type": "section",
                                            "field_repeat": true
                                        },
                                        {
                                            "field_required": false,
                                            "field_max": 0,
                                            "field_min": 0,
                                            "field_label": "ground_beetle",
                                            "field_children": [
                                                {
                                                    "field_required": false,
                                                    "field_key": "ObsPicture_2",
                                                    "field_label": "Add the picture of ground beetle",
                                                    "field_type": "picturepicker"
                                                },
                                                {
                                                    "field_species_type": "ground_beetle",
                                                    "field_type": "recognition"
                                                },
                                                {
                                                    "field_key": "ground_beetle_scientific_name",
                                                    "select_options": [
                                                        {
                                                            "label": "Carabus nemoralis"
                                                        },
                                                        {
                                                            "label": "Pterostichus melanarius"
                                                        },
                                                        {
                                                            "label": "Harpalus rufipes"
                                                        },
                                                        {
                                                            "label": "Amara aenea"
                                                        },
                                                        {
                                                            "label": "Bembidion lampros"
                                                        },
                                                        {
                                                            "label": "Nebria brevicollis"
                                                        },
                                                        {
                                                            "label": "Notiophilus biguttatus"
                                                        },
                                                        {
                                                            "label": "Poecilus cupreus"
                                                        },
                                                        {
                                                            "label": "Agonum dorsale"
                                                        },
                                                        {
                                                            "label": "Calathus fuscipes"
                                                        }
                                                    ],
                                                    "field_label": "Ground Beetle Scientific Name",
                                                    "field_type": "select"
                                                }
                                            ],
                                            "field_type": "section",
                                            "field_repeat": true
                                        },
                                        {
                                            "field_required": false,
                                            "field_max": 0,
                                            "field_min": 0,
                                            "field_label": "other_species",
                                            "field_children": [
                                                {
                                                    "field_required": false,
                                                    "field_key": "ObsPicture_3",
                                                    "field_label": "Add the picture of ant",
                                                    "field_type": "picturepicker"
                                                },
                                                {
                                                    "field_species_type": "ant",
                                                    "field_type": "recognition"
                                                },
                                                {
                                                    "field_key": "ground_beetle_scientific_name",
                                                    "select_options": [
                                                        {
                                                            "label": "Ants"
                                                        },
                                                        {
                                                            "label": "Centipedes"
                                                        },
                                                        {
                                                            "label": "Sowbugs"
                                                        },
                                                        {
                                                            "label": "Reptiles"
                                                        },
                                                        {
                                                            "label": "Amphibians"
                                                        },
                                                        {
                                                            "label": "Small mammals"
                                                        }
                                                    ],
                                                    "field_label": "Ground Beetle Scientific Name",
                                                    "select_multi": true,
                                                    "field_type": "select"
                                                }
                                            ],
                                            "field_type": "section",
                                            "field_repeat": true
                                        }
                                    ],
                                    "field_type": "sections",
                                    "field_repeat": true
                                }
                            ],
                            "form_category": "protocol",
                            "form_id": "mollusk_protocole_2"
                        }
                    },
                    "form_id": "mollusk_protocole_1",
                    "formData": {
                        "form_version": "1.0.2",
                        "form_label": "First page of the mollusk protocol",
                        "last_updated": {
                            "seconds": 1736835695,
                            "nanos": 0
                        },
                        "form": [
                            {
                                "field_hint": "Put the name of the observer",
                                "field_required": true,
                                "field_key": "observer",
                                "field_label": "Observer name",
                                "input_type": "text",
                                "field_type": "input"
                            },
                            {
                                "field_key": "geoPoint",
                                "field_label": "Location",
                                "field_type": "location"
                            },
                            {
                                "field_key": "polygonCoordinates",
                                "field_label": "Polygon coordinates",
                                "field_type": "polygonpicker"
                            },
                            {
                                "field_required": true,
                                "field_key": "date",
                                "field_label": "Date of the observation",
                                "field_type": "datepicker"
                            }
                        ],
                        "form_category": "protocol",
                        "form_id": "mollusk_protocole_1"
                    }
                }
            ]
        },
        "geoPoint": {
            "latitude": 48.7771411,
            "longitude": 2.3753301
        },
        "email": "diego.roulle@u-pec.fr",
        "domainId": "CDG"
    }
]