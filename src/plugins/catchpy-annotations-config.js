export default {
    databaseUrl: function(canvasId) {
        return "https://catchpy.harvardx.harvard.edu/annos/search?parentid=&contextId=course-v1%3AHarvardX%2BTECH1%2B2018&collectionId=a9e84d73-1c61-4115-8880-d9fcab0f2257&media=image&limit=-1&uri=" + encodeURI(canvasId);
    },
    databaseAuthorizationHeaders: function() {
        return {
            'x-annotator-auth-token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3N1ZWRBdCI6IjIwMTktMDQtMDJUMTc6MTM6MTMrMDA6MDAiLCJjb25zdW1lcktleSI6IjAxNzkxZTg1LWVlMGYtNDYxOC1hYTVhLWViYzhjZmUzMDYyOCIsInVzZXJJZCI6IjY5MmJkODFkODRkNjUyOTgzZDlhZWNmODcxMjJiYTIyIiwidHRsIjo4NjQwMH0.KNGmdAo1eMTyPXo6o8LDIpvvF5qc4cNBB3exZwPqo-U"
        }
    },
    resultHandler: function(result, canvasId) {
        var oaAnnotations = {
            "@context": "http://www.shared-canvas.org/ns/context.json",
            "@id": canvasId + "/annotationList",
            "@type": "sc:AnnotationList",
            "resources": []
        };
        result.rows.forEach(function(annotation) {
            var id,
            motivation = [],
            resource = [],
            on,
            annotatedBy;
            //convert annotation to OA format

            id = annotation.id;  //need to make URI

            if (annotation.tags.length > 0) {
              motivation.push("oa:tagging");
              annotation.tags.forEach(function(value) {
                resource.push({
                  "@type":"oa:Tag",
                  "chars":value
                });
              });
            }
            if (annotation.parent && annotation.parent !== "0") {
              motivation.push("oa:replying");
              on = annotation.parent;  //need to make URI
            } else {
              var value;
              motivation.push("oa:commenting");
              if (Array.isArray(annotation.rangePosition)) {
                //dual strategy
                // on  = annotation.rangePosition;
                value = annotation.rangePosition[0].selector.default.value;
                on = { "@type" : "oa:SpecificResource",
                  "full" : annotation.uri,
                  "selector": {
                      "@type": "oa:FragmentSelector",
                      "value": value
                  }
                };
              } else if (typeof annotation.rangePosition === 'object') {
                //legacy strategy
                value = "xywh="+annotation.rangePosition.x+","+annotation.rangePosition.y+","+annotation.rangePosition.width+","+annotation.rangePosition.height;
                on = { "@type" : "oa:SpecificResource",
                  "full" : annotation.uri,
                  "selector": {
                      "@type": "oa:FragmentSelector",
                      "value": value
                  }
                };
              } else {
                //2.1 strategy
                value = annotation.rangePosition;
                on = { "@type" : "oa:SpecificResource",
                  "full" : annotation.uri,
                  "selector": {
                    "@type": "oa:SvgSelector",
                    "value": value
                  }
                };
              }
            }
            resource.push( {
              "@type" : "dctypes:Text",
              "format" : "text/html",
              "chars" : annotation.text
            });

            annotatedBy = { 
              "@id" : annotation.user.id,
              "name" : annotation.user.name
            };

            var oaAnnotation = {
              "@context" : "http://iiif.io/api/presentation/2/context.json",
              "@id" : String(id),
              "@type" : "oa:Annotation",
              "motivation" : motivation,
              "resource" : resource,
              "on" : on,
              "annotatedBy" : annotatedBy,
              "annotatedAt" : annotation.created,
              "serializedAt" : annotation.updated,
              "permissions" : annotation.permissions,
              "endpoint" : this
            };
          oaAnnotations.resources.push(oaAnnotation);
        });
        return {
            id: oaAnnotations['@id'],
            json: oaAnnotations
        }
    }
}